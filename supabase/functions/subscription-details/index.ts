
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.18.0?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function for logging
const log = (message: string, details?: any) => {
  console.log(`[subscription-details] ${message}${details ? ': ' + JSON.stringify(details) : ''}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    log("Function called");
    
    // Create a Supabase client with admin access using service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    log("Authorization header present", !!authHeader);

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header provided" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract the JWT token
    const token = authHeader.replace("Bearer ", "");
    
    // Get the user from the token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError) {
      log("Error getting user", userError.message);
      return new Response(JSON.stringify({ error: "Unauthorized or invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    if (!user) {
      log("No user found from auth token");
      return new Response(JSON.stringify({ error: "No user found" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const userId = user.id;
    log("User found with ID", userId);

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      log("STRIPE_SECRET_KEY not found in environment");
      return new Response(JSON.stringify({ error: "Stripe key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Get the customer ID from the database
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", userId)
      .single();

    if (subscriptionError) {
      log("Error fetching subscription", subscriptionError.message);
      
      // Check if it's because no subscription exists
      if (subscriptionError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ 
            error: "No subscription record found",
            subscription: null
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Error fetching subscription",
          details: subscriptionError.message,
          subscription: null
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    if (!subscription?.stripe_subscription_id) {
      log("No Stripe subscription ID found for user", userId);
      
      // Check if we have a customer ID but no subscription
      if (subscription?.stripe_customer_id) {
        log("Customer ID found but no subscription", subscription.stripe_customer_id);
        
        // Try to find active subscriptions for this customer
        try {
          const subscriptions = await stripe.subscriptions.list({
            customer: subscription.stripe_customer_id,
            status: 'active',
            limit: 1,
          });
          
          if (subscriptions.data.length > 0) {
            // Found an active subscription, update our database
            const stripeSubscription = subscriptions.data[0];
            log("Found active subscription in Stripe", stripeSubscription.id);
            
            // Update the user_subscriptions table
            await supabaseAdmin
              .from("user_subscriptions")
              .update({
                stripe_subscription_id: stripeSubscription.id,
                is_subscribed: true,
                subscription_status: 'active',
                current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq("user_id", userId);
            
            // Format response data
            const subscriptionData = {
              id: stripeSubscription.id,
              status: stripeSubscription.status,
              current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: stripeSubscription.cancel_at_period_end,
              cancel_at: stripeSubscription.cancel_at 
                ? new Date(stripeSubscription.cancel_at * 1000).toISOString() 
                : null,
              canceled_at: stripeSubscription.canceled_at 
                ? new Date(stripeSubscription.canceled_at * 1000).toISOString() 
                : null,
            };
            
            return new Response(JSON.stringify({ subscription: subscriptionData }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          }
        } catch (error) {
          log("Error checking Stripe for subscriptions", error.message);
        }
      }
      
      return new Response(
        JSON.stringify({ 
          error: "No subscription found",
          subscription: null
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    log("Found subscription with ID", subscription.stripe_subscription_id);

    // Get the subscription details from Stripe
    let stripeSubscription;
    try {
      stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripe_subscription_id
      );
      log("Retrieved Stripe subscription", stripeSubscription.id);
    } catch (error) {
      log("Error retrieving subscription from Stripe", error.message);
      
      // If the subscription doesn't exist in Stripe anymore, update our DB
      if (error.code === 'resource_missing') {
        await supabaseAdmin
          .from("user_subscriptions")
          .update({
            is_subscribed: false,
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq("user_id", userId);
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Error retrieving subscription",
          details: error.message,
          subscription: null
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Format response data
    const subscriptionData = {
      id: stripeSubscription.id,
      status: stripeSubscription.status,
      current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      cancel_at: stripeSubscription.cancel_at 
        ? new Date(stripeSubscription.cancel_at * 1000).toISOString() 
        : null,
      canceled_at: stripeSubscription.canceled_at 
        ? new Date(stripeSubscription.canceled_at * 1000).toISOString() 
        : null,
    };

    // Update the user_subscriptions table with the latest details
    const { error: updateError } = await supabaseAdmin
      .from("user_subscriptions")
      .update({
        is_subscribed: stripeSubscription.status === "active",
        subscription_status: subscriptionData.status,
        current_period_start: subscriptionData.current_period_start,
        current_period_end: subscriptionData.current_period_end,
        cancel_at_period_end: subscriptionData.cancel_at_period_end,
        cancel_at: subscriptionData.cancel_at,
        canceled_at: subscriptionData.canceled_at,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (updateError) {
      log("Error updating subscription in database", updateError.message);
      return new Response(
        JSON.stringify({ 
          error: "Error updating subscription",
          details: updateError.message,
          subscription: subscriptionData 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    log("Successfully updated subscription in database");
    
    return new Response(JSON.stringify({ subscription: subscriptionData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    log("Unhandled error", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
