
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
    console.log("Subscription details endpoint called");
    
    // Create a Supabase client with admin access using service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    console.log("Authorization header present:", !!authHeader);

    // Create a Supabase client with the auth header if provided
    const supabaseClient = authHeader ? createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    ) : supabaseAdmin;

    // Get the user from the request if auth header is provided
    let userId;
    
    if (authHeader) {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
      
      if (userError) {
        console.error("Error getting user:", userError.message);
        return new Response(JSON.stringify({ error: "Unauthorized or invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (!user) {
        console.error("No user found from auth token");
        return new Response(JSON.stringify({ error: "No user found" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      userId = user.id;
      console.log("User found with ID:", userId);
    } else {
      // This would be for admin access or webhook calls
      console.log("No auth header provided, assuming admin/webhook access");
      
      // Check for user_id in request body for webhook scenarios
      try {
        const requestData = await req.json();
        userId = requestData.user_id;
        console.log("Using user_id from request body:", userId);
      } catch (e) {
        console.log("No request body or user_id provided");
      }
      
      if (!userId) {
        return new Response(JSON.stringify({ error: "No user_id provided" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get the customer ID from the database
    const { data: subscription, error: subscriptionError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("stripe_customer_id, stripe_subscription_id")
      .eq("user_id", userId)
      .single();

    if (subscriptionError) {
      console.error("Error fetching subscription:", subscriptionError.message);
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
      console.log("No subscription found for user:", userId);
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

    console.log("Found subscription:", subscription);

    // Get the subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripe_subscription_id
    );

    console.log("Retrieved Stripe subscription:", stripeSubscription.id, "Status:", stripeSubscription.status);

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
      console.error("Error updating subscription in database:", updateError.message);
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

    console.log("Successfully updated subscription in database for user:", userId);
    
    return new Response(JSON.stringify({ subscription: subscriptionData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
