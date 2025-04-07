
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
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a Supabase client for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log(`Event received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        const checkoutSession = event.data.object;
        console.log(`Checkout completed: ${checkoutSession.id}`);
        
        if (checkoutSession.customer && checkoutSession.subscription) {
          // Get customer details to find the user
          const customer = await stripe.customers.retrieve(checkoutSession.customer.toString());
          
          if (!customer.deleted && customer.email) {
            // Find the user by email
            const { data: users, error: userError } = await supabaseClient
              .from("auth.users")
              .select("id")
              .eq("email", customer.email)
              .limit(1);

            if (userError) {
              console.error("Error finding user:", userError);
              break;
            }

            if (users && users.length > 0) {
              const userId = users[0].id;
              
              // Update user subscription data
              const { error: updateError } = await supabaseClient
                .from("user_subscriptions")
                .update({
                  is_subscribed: true,
                  stripe_customer_id: checkoutSession.customer.toString(),
                  stripe_subscription_id: checkoutSession.subscription.toString(),
                  subscription_status: "active",
                  updated_at: new Date().toISOString()
                })
                .eq("user_id", userId);

              if (updateError) {
                console.error("Error updating subscription:", updateError);
              } else {
                console.log(`Subscription updated for user ${userId}`);
              }
            } else {
              console.error("User not found with email:", customer.email);
            }
          }
        }
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object;
        console.log(`Invoice payment succeeded: ${invoice.id}`);
        
        // Only process subscription invoices
        if (invoice.subscription && invoice.customer) {
          // Get subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription.toString());
          
          // Find the user by stripe_customer_id
          const { data: subUsers, error: subUserError } = await supabaseClient
            .from("user_subscriptions")
            .select("user_id")
            .eq("stripe_customer_id", invoice.customer.toString())
            .limit(1);

          if (subUserError) {
            console.error("Error finding user by customer ID:", subUserError);
            break;
          }
          
          if (subUsers && subUsers.length > 0) {
            const userId = subUsers[0].user_id;
            
            // Update the user's subscription information
            const { error: updateError } = await supabaseClient
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
          }
        }
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object;
        console.log(`Subscription deleted: ${deletedSubscription.id}`);
        
        // Find the user with this subscription ID
        const { data: delSubUsers, error: delSubError } = await supabaseClient
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", deletedSubscription.id)
          .limit(1);

        if (delSubError) {
          console.error("Error finding user by subscription ID:", delSubError);
          break;
        }
        
        if (delSubUsers && delSubUsers.length > 0) {
          const userId = delSubUsers[0].user_id;
          
          // Update the user's subscription information
          const { error: updateError } = await supabaseClient
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
        }
        break;

      case "customer.subscription.updated":
        const updatedSubscription = event.data.object;
        console.log(`Subscription updated: ${updatedSubscription.id}`);
        
        // Find the user with this subscription ID
        const { data: upSubUsers, error: upSubError } = await supabaseClient
          .from("user_subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", updatedSubscription.id)
          .limit(1);

        if (upSubError) {
          console.error("Error finding user by subscription ID:", upSubError);
          break;
        }
        
        if (upSubUsers && upSubUsers.length > 0) {
          const userId = upSubUsers[0].user_id;
          
          // Update the user's subscription information
          const { error: updateError } = await supabaseClient
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
        }
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
