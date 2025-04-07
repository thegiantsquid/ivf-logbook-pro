
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.18.0?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Webhook received. Processing...");
    
    // Get the stripe signature from the request headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("No stripe signature found");
      return new Response(
        JSON.stringify({ error: "No stripe signature found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the request body and verify the webhook signature
    const body = await req.text();
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    let event;
    try {
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
      // Use the async version of constructEvent
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      console.log(`Event verified: ${event.type}`);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a Supabase client for database operations with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", // Using service role key for admin access
      { auth: { persistSession: false } }
    );

    console.log(`Processing event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSession = event.data.object;
        console.log(`Checkout completed: ${checkoutSession.id}`);
        
        if (checkoutSession.customer && checkoutSession.subscription) {
          // Get customer details to find the user
          const customer = await stripe.customers.retrieve(checkoutSession.customer.toString());
          
          if (!customer.deleted && customer.email) {
            console.log(`Looking for user with email: ${customer.email}`);
            
            // Find the user by email
            const { data: users, error: userError } = await supabaseAdmin
              .from("auth.users")
              .select("id")
              .eq("email", customer.email)
              .limit(1);

            if (userError) {
              console.error("Error finding user:", userError);
              
              // Try alternative way to find the user
              const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
              if (authError) {
                console.error("Error listing users:", authError);
                break;
              }
              
              const matchingUser = authUsers.users.find(u => u.email === customer.email);
              if (!matchingUser) {
                console.error("User not found with email:", customer.email);
                break;
              }
              
              const userId = matchingUser.id;
              console.log(`User found through auth admin API: ${userId}`);
              
              // Update user subscription
              await updateSubscription(supabaseAdmin, userId, checkoutSession, stripe);
            } else if (users && users.length > 0) {
              const userId = users[0].id;
              console.log(`User found with ID: ${userId}`);
              
              // Update user subscription
              await updateSubscription(supabaseAdmin, userId, checkoutSession, stripe);
            } else {
              console.error("User not found with email:", customer.email);
            }
          }
        }
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePayment(supabaseAdmin, event, stripe);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(supabaseAdmin, event);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(supabaseAdmin, event);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`Webhook error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function updateSubscription(supabase, userId, checkoutSession, stripe) {
  console.log(`Updating subscription for user ${userId}`);
  
  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription.toString());
  
  // Check if user subscription record exists
  const { data: existingSub, error: checkError } = await supabase
    .from("user_subscriptions")
    .select("id")
    .eq("user_id", userId)
    .single();
    
  if (checkError && checkError.code !== "PGRST116") { // Not found error code
    console.error("Error checking existing subscription:", checkError);
  }
  
  const updateData = {
    is_subscribed: true,
    stripe_customer_id: checkoutSession.customer.toString(),
    stripe_subscription_id: checkoutSession.subscription.toString(),
    subscription_status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };
  
  if (existingSub) {
    // Update existing subscription
    console.log(`Updating existing subscription for user ${userId}`);
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update(updateData)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating subscription:", updateError);
    } else {
      console.log(`Subscription updated for user ${userId}`);
    }
  } else {
    // Insert new subscription record
    console.log(`Creating new subscription for user ${userId}`);
    const { error: insertError } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        ...updateData
      });

    if (insertError) {
      console.error("Error creating subscription:", insertError);
    } else {
      console.log(`New subscription created for user ${userId}`);
    }
  }
}

async function handleInvoicePayment(supabase, event, stripe) {
  const invoice = event.data.object;
  console.log(`Invoice payment succeeded: ${invoice.id}`);
  
  // Only process subscription invoices
  if (invoice.subscription && invoice.customer) {
    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription.toString());
    
    // Find the user by stripe_customer_id
    const { data: subUsers, error: subUserError } = await supabase
      .from("user_subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", invoice.customer.toString())
      .limit(1);

    if (subUserError) {
      console.error("Error finding user by customer ID:", subUserError);
      return;
    }
    
    if (subUsers && subUsers.length > 0) {
      const userId = subUsers[0].user_id;
      console.log(`User found with ID: ${userId}`);
      
      // Update the user's subscription information
      const { error: updateError } = await supabase
        .from("user_subscriptions")
        .update({
          is_subscribed: true,
          subscription_status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating subscription period:", updateError);
      } else {
        console.log(`Subscription period updated for user ${userId}`);
      }
    } else {
      console.error("No user found with customer ID:", invoice.customer.toString());
    }
  }
}

async function handleSubscriptionDeleted(supabase, event) {
  const deletedSubscription = event.data.object;
  console.log(`Subscription deleted: ${deletedSubscription.id}`);
  
  // Find the user with this subscription ID
  const { data: delSubUsers, error: delSubError } = await supabase
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", deletedSubscription.id)
    .limit(1);

  if (delSubError) {
    console.error("Error finding user by subscription ID:", delSubError);
    return;
  }
  
  if (delSubUsers && delSubUsers.length > 0) {
    const userId = delSubUsers[0].user_id;
    console.log(`User found with ID: ${userId}`);
    
    // Update the user's subscription information
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        is_subscribed: false,
        subscription_status: "canceled",
        subscription_end_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating cancelled subscription:", updateError);
    } else {
      console.log(`Subscription cancelled for user ${userId}`);
    }
  } else {
    console.error("No user found with subscription ID:", deletedSubscription.id);
  }
}

async function handleSubscriptionUpdated(supabase, event) {
  const updatedSubscription = event.data.object;
  console.log(`Subscription updated: ${updatedSubscription.id}`);
  
  // Find the user with this subscription ID
  const { data: upSubUsers, error: upSubError } = await supabase
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", updatedSubscription.id)
    .limit(1);

  if (upSubError) {
    console.error("Error finding user by subscription ID:", upSubError);
    return;
  }
  
  if (upSubUsers && upSubUsers.length > 0) {
    const userId = upSubUsers[0].user_id;
    console.log(`User found with ID: ${userId}`);
    
    // Update the user's subscription information
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        subscription_status: updatedSubscription.status,
        current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: updatedSubscription.cancel_at_period_end,
        cancel_at: updatedSubscription.cancel_at 
          ? new Date(updatedSubscription.cancel_at * 1000).toISOString() 
          : null,
        canceled_at: updatedSubscription.canceled_at 
          ? new Date(updatedSubscription.canceled_at * 1000).toISOString() 
          : null,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating subscription details:", updateError);
    } else {
      console.log(`Subscription details updated for user ${userId}`);
    }
  } else {
    console.error("No user found with subscription ID:", updatedSubscription.id);
  }
}
