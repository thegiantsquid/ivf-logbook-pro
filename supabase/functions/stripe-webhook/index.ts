
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.8.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.26.0";

// Initialize Stripe with your secret key
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";
    
    // For debugging: Log the request headers and body
    console.log("Webhook request headers:", JSON.stringify(Object.fromEntries(req.headers.entries())));
    console.log("Webhook request body length:", body.length);
    console.log("Signature present:", !!signature);
    
    // Verify webhook signature
    let event;
    try {
      // Use your Stripe webhook secret
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
      console.log("Webhook secret available:", !!webhookSecret);
      
      if (!webhookSecret) {
        throw new Error("Missing STRIPE_WEBHOOK_SECRET environment variable");
      }
      
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log(`Received event: ${event.type}`);

    // Handle the event based on its type
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Processing checkout.session.completed event:", session.id);
        
        try {
          // Get customer details
          const customer = await stripe.customers.retrieve(session.customer);
          console.log("Customer retrieved:", customer.id, customer.email);
          
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          console.log("Subscription retrieved:", subscription.id);
          
          // Get user by email from Supabase
          // First check if the customer has an email
          if (!customer.email) {
            console.error("Customer has no email:", customer.id);
            break;
          }
          
          console.log("Looking up user with email:", customer.email);
          
          // Query using auth.users
          const { data: users, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("email", customer.email)
            .single();
          
          if (userError) {
            console.error("Error fetching user by email:", userError);
            // Try alternate approach using auth.users
            const { data: authUsers, error: authError } = await supabase
              .auth
              .admin
              .listUsers({ 
                filter: { 
                  email: customer.email 
                }
              });
              
            if (authError || !authUsers.users || authUsers.users.length === 0) {
              console.error("Error fetching user from auth:", authError || "No user found");
              break;
            }
            
            const userId = authUsers.users[0].id;
            console.log("User found in auth:", userId);
            
            // Update user_subscriptions table
            const { error: updateError } = await supabase
              .from("user_subscriptions")
              .update({
                stripe_customer_id: customer.id,
                stripe_subscription_id: subscription.id,
                is_subscribed: true,
                subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq("user_id", userId);
              
            if (updateError) {
              console.error("Error updating subscription:", updateError);
            } else {
              console.log("Subscription updated for user:", userId);
            }
          } else {
            const userId = users.id;
            console.log("User found in users table:", userId);
            
            // Update user_subscriptions table
            const { error: updateError } = await supabase
              .from("user_subscriptions")
              .update({
                stripe_customer_id: customer.id,
                stripe_subscription_id: subscription.id,
                is_subscribed: true,
                subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq("user_id", userId);
              
            if (updateError) {
              console.error("Error updating subscription:", updateError);
            } else {
              console.log("Subscription updated for user:", userId);
            }
          }
        } catch (processError) {
          console.error("Error processing checkout session:", processError);
        }
        
        break;
      }
      
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        console.log("Processing invoice.payment_succeeded event:", invoice.id);
        
        try {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          console.log("Subscription retrieved:", subscription.id);
          
          // Get customer details
          const customer = await stripe.customers.retrieve(invoice.customer);
          console.log("Customer retrieved:", customer.id, customer.email);
          
          if (!customer.email) {
            console.error("Customer has no email:", customer.id);
            break;
          }
          
          // Query using auth.users
          const { data: users, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("email", customer.email)
            .single();
            
          if (userError) {
            console.error("Error fetching user by email:", userError);
            // Try alternate approach using auth.users
            const { data: authUsers, error: authError } = await supabase
              .auth
              .admin
              .listUsers({ 
                filter: { 
                  email: customer.email 
                }
              });
              
            if (authError || !authUsers.users || authUsers.users.length === 0) {
              console.error("Error fetching user from auth:", authError || "No user found");
              break;
            }
            
            const userId = authUsers.users[0].id;
            console.log("User found in auth:", userId);
            
            // Update user_subscriptions table
            const { error: updateError } = await supabase
              .from("user_subscriptions")
              .update({
                is_subscribed: true,
                subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq("user_id", userId);
              
            if (updateError) {
              console.error("Error updating subscription:", updateError);
            } else {
              console.log("Subscription updated for user:", userId);
            }
          } else {
            const userId = users.id;
            console.log("User found in users table:", userId);
            
            // Update user_subscriptions table
            const { error: updateError } = await supabase
              .from("user_subscriptions")
              .update({
                is_subscribed: true,
                subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq("user_id", userId);
              
            if (updateError) {
              console.error("Error updating subscription:", updateError);
            } else {
              console.log("Subscription updated for user:", userId);
            }
          }
        } catch (processError) {
          console.error("Error processing invoice payment:", processError);
        }
        
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log("Processing customer.subscription.deleted event:", subscription.id);
        
        try {
          // Get customer details
          const customer = await stripe.customers.retrieve(subscription.customer);
          console.log("Customer retrieved:", customer.id, customer.email);
          
          if (!customer.email) {
            console.error("Customer has no email:", customer.id);
            break;
          }
          
          // Query using auth.users
          const { data: users, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("email", customer.email)
            .single();
            
          if (userError) {
            console.error("Error fetching user by email:", userError);
            // Try alternate approach using auth.users
            const { data: authUsers, error: authError } = await supabase
              .auth
              .admin
              .listUsers({ 
                filter: { 
                  email: customer.email 
                }
              });
              
            if (authError || !authUsers.users || authUsers.users.length === 0) {
              console.error("Error fetching user from auth:", authError || "No user found");
              break;
            }
            
            const userId = authUsers.users[0].id;
            console.log("User found in auth:", userId);
            
            // Update user_subscriptions table
            const { error: updateError } = await supabase
              .from("user_subscriptions")
              .update({
                is_subscribed: false,
                subscription_end_date: null,
                updated_at: new Date().toISOString()
              })
              .eq("user_id", userId);
              
            if (updateError) {
              console.error("Error updating subscription:", updateError);
            } else {
              console.log("Subscription updated for user:", userId);
            }
          } else {
            const userId = users.id;
            console.log("User found in users table:", userId);
            
            // Update user_subscriptions table
            const { error: updateError } = await supabase
              .from("user_subscriptions")
              .update({
                is_subscribed: false,
                subscription_end_date: null,
                updated_at: new Date().toISOString()
              })
              .eq("user_id", userId);
              
            if (updateError) {
              console.error("Error updating subscription:", updateError);
            } else {
              console.log("Subscription updated for user:", userId);
            }
          }
        } catch (processError) {
          console.error("Error processing subscription deletion:", processError);
        }
        
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
