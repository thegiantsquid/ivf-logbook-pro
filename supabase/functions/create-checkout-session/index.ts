
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Stripe from "https://esm.sh/stripe@12.18.0?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function for logging
const log = (message: string, details?: any) => {
  console.log(`[CREATE-CHECKOUT] ${message}${details ? ': ' + JSON.stringify(details) : ''}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    log("Function started");
    
    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      log("No authorization header");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Extract the JWT token and get user information
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      log(`Auth error: ${userError?.message || "No user found"}`);
      return new Response(
        JSON.stringify({ error: userError?.message || "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = userData.user;
    log(`User authenticated: ${user.id}, ${user.email}`);

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      log("STRIPE_SECRET_KEY not found");
      return new Response(
        JSON.stringify({ error: "Stripe key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Check if user already has a Stripe customer ID
    log("Checking for existing Stripe customer");
    const { data: subscription, error: fetchError } = await supabaseClient
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (fetchError) {
      log(`Error fetching subscription: ${fetchError.message}`);
      // Continue anyway, we'll create or find a customer
    }

    let customerId = subscription?.stripe_customer_id;

    // If no customer ID found, check by email or create a new customer
    if (!customerId) {
      log("No customer ID in database, checking Stripe by email");
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        log(`Found existing Stripe customer by email: ${customerId}`);
      } else {
        log("Creating new Stripe customer");
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            user_id: user.id,
          },
        });
        customerId = newCustomer.id;
        log(`Created new Stripe customer: ${customerId}`);
      }

      // Check if user already has a record in user_subscriptions
      const { data: existingRecord, error: recordError } = await supabaseClient
        .from("user_subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (recordError) {
        log(`Error checking existing record: ${recordError.message}`);
      }

      // Prepare subscription data
      const subscriptionData = {
        user_id: user.id,
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString()
      };
      
      log("Saving customer ID to database");
      
      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabaseClient
          .from("user_subscriptions")
          .update(subscriptionData)
          .eq("user_id", user.id);
          
        if (updateError) {
          log(`Error updating record: ${updateError.message}`);
          log(`Update error details: ${JSON.stringify(updateError)}`);
        } else {
          log("Successfully updated customer ID in database");
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabaseClient
          .from("user_subscriptions")
          .insert({
            ...subscriptionData,
            is_subscribed: false,
            trial_start_date: new Date().toISOString(),
            trial_end_date: null
          });
          
        if (insertError) {
          log(`Error inserting record: ${insertError.message}`);
          log(`Insert error details: ${JSON.stringify(insertError)}`);
          // Continue anyway, this is not critical for checkout
        } else {
          log("Successfully inserted new record into database");
        }
      }
    }

    // Create a new checkout session
    log("Creating Stripe checkout session");
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp", // Changed from USD to GBP
            product_data: {
              name: "Professional Plan",
              description: "Advanced features for medical professionals",
            },
            unit_amount: 1900, // £19.00
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?subscription=success`,
      cancel_url: `${origin}/subscribe?subscription=canceled`,
      allow_promotion_codes: true,
    });

    log(`Checkout session created: ${session.id}, URL: ${session.url}`);

    // Return the checkout session URL
    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    log(`Error: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
