
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
    
    // Verify webhook signature
    let event;
    try {
      // Use your Stripe webhook secret
      const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
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
        
        // Get customer details
        const customer = await stripe.customers.retrieve(session.customer);
        
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
        // Get user by email from Supabase
        const { data: users, error: userError } = await supabase
          .from("auth.users")
          .select("id")
          .eq("email", customer.email)
          .single();
          
        if (userError) {
          console.error("Error fetching user:", userError);
          break;
        }
        
        const userId = users.id;
        
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
        }
        
        break;
      }
      
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        
        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        
        // Get customer details
        const customer = await stripe.customers.retrieve(invoice.customer);
        
        // Get user by email from Supabase
        const { data: users, error: userError } = await supabase
          .from("auth.users")
          .select("id")
          .eq("email", customer.email)
          .single();
          
        if (userError) {
          console.error("Error fetching user:", userError);
          break;
        }
        
        const userId = users.id;
        
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
        }
        
        break;
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        
        // Get customer details
        const customer = await stripe.customers.retrieve(subscription.customer);
        
        // Get user by email from Supabase
        const { data: users, error: userError } = await supabase
          .from("auth.users")
          .select("id")
          .eq("email", customer.email)
          .single();
          
        if (userError) {
          console.error("Error fetching user:", userError);
          break;
        }
        
        const userId = users.id;
        
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
