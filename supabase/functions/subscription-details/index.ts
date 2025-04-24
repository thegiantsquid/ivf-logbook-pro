
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

    // First check the database for subscription details
    log("Checking subscription in database");
    const { data: dbSubscription, error: dbError } = await supabaseAdmin
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (dbError) {
      log("Error querying database", dbError);
      log("Database error details", JSON.stringify(dbError));
      // Don't return early, continue to check Stripe
    }
    
    log("Database subscription data", dbSubscription);

    // If we have a subscription in the database with a stripe_customer_id, verify with Stripe
    if (dbSubscription?.stripe_customer_id) {
      log("Found subscription in database", { 
        customerId: dbSubscription.stripe_customer_id,
        subscriptionId: dbSubscription.stripe_subscription_id
      });

      try {
        // If we have a subscription ID, check its status directly
        if (dbSubscription.stripe_subscription_id) {
          log("Checking subscription status in Stripe");
          const stripeSubscription = await stripe.subscriptions.retrieve(
            dbSubscription.stripe_subscription_id
          );
          
          log("Retrieved subscription from Stripe", { 
            status: stripeSubscription.status,
            id: stripeSubscription.id 
          });

          const isActive = stripeSubscription.status === 'active';
          
          // Update the database with the latest details from Stripe
          const updateData = {
            is_subscribed: isActive,
            subscription_status: stripeSubscription.status,
            subscription_end_date: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          };
          
          log("Updating subscription in database", updateData);
          const { error: updateError } = await supabaseAdmin
            .from("user_subscriptions")
            .update(updateData)
            .eq("user_id", userId);
          
          if (updateError) {
            log("Error updating subscription", updateError);
            log("Error details", JSON.stringify(updateError));
          } else {
            log("Successfully updated subscription in database");
          }
          
          return new Response(JSON.stringify({
            subscription: {
              id: stripeSubscription.id,
              status: stripeSubscription.status,
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: stripeSubscription.cancel_at_period_end,
              is_active: isActive
            }
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        // If no subscription ID but we have a customer ID, check for active subscriptions
        log("No subscription ID, checking for active subscriptions by customer ID");
        const subscriptions = await stripe.subscriptions.list({
          customer: dbSubscription.stripe_customer_id,
          status: 'active',
          limit: 1
        });
        
        if (subscriptions.data.length > 0) {
          const activeSubscription = subscriptions.data[0];
          log("Found active subscription", { id: activeSubscription.id });
          
          // Update database with found subscription
          const updateData = {
            is_subscribed: true,
            stripe_subscription_id: activeSubscription.id,
            subscription_status: activeSubscription.status,
            subscription_end_date: new Date(activeSubscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          };
          
          log("Updating subscription in database", updateData);
          const { error: updateError } = await supabaseAdmin
            .from("user_subscriptions")
            .update(updateData)
            .eq("user_id", userId);
          
          if (updateError) {
            log("Error updating subscription", updateError);
            log("Error details", JSON.stringify(updateError));
          } else {
            log("Successfully updated subscription in database");
          }
          
          return new Response(JSON.stringify({
            subscription: {
              id: activeSubscription.id,
              status: activeSubscription.status,
              current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: activeSubscription.cancel_at_period_end,
              is_active: true
            }
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (error) {
        log("Error checking with Stripe", error.message);
        // Continue to fallback if Stripe check fails
      }
    }
    
    // If no subscription found in the database, check Stripe by user email
    log("Checking Stripe by email");
    try {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1
      });
      
      if (customers.data.length > 0) {
        const customer = customers.data[0];
        log("Found customer in Stripe", { id: customer.id });
        
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
          limit: 1
        });
        
        if (subscriptions.data.length > 0) {
          const subscription = subscriptions.data[0];
          log("Found active subscription in Stripe", { id: subscription.id });
          
          // Create or update the subscription in the database
          const subscriptionData = {
            user_id: userId,
            is_subscribed: true,
            stripe_customer_id: customer.id,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          };
          
          log("Upserting subscription in database", subscriptionData);
          
          // Check if a record exists
          const { data: existingRecord } = await supabaseAdmin
            .from("user_subscriptions")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();
            
          if (existingRecord) {
            // Update existing record
            log("Updating existing record");
            const { error: updateError } = await supabaseAdmin
              .from("user_subscriptions")
              .update(subscriptionData)
              .eq("user_id", userId);
              
            if (updateError) {
              log("Error updating subscription", updateError);
              log("Error details", JSON.stringify(updateError));
            } else {
              log("Successfully updated subscription in database");
            }
          } else {
            // Insert new record
            log("Inserting new record");
            const finalData = {
              ...subscriptionData,
              trial_start_date: new Date().toISOString(),
              trial_end_date: null
            };
            
            const { error: insertError } = await supabaseAdmin
              .from("user_subscriptions")
              .insert(finalData);
              
            if (insertError) {
              log("Error inserting subscription", insertError);
              log("Error details", JSON.stringify(insertError));
            } else {
              log("Successfully inserted subscription into database");
            }
          }
          
          return new Response(JSON.stringify({
            subscription: {
              id: subscription.id,
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              is_active: true
            }
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        log("No customer found in Stripe for email", user.email);
      }
    } catch (stripeError) {
      log("Error checking Stripe", stripeError.message);
    }
    
    // If we reach here, no active subscription was found
    log("No active subscription found");
    
    // Update the database to reflect no subscription if we had one before
    if (dbSubscription) {
      log("Updating database to reflect no subscription");
      const { error: updateError } = await supabaseAdmin
        .from("user_subscriptions")
        .update({
          is_subscribed: false,
          subscription_status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);
      
      if (updateError) {
        log("Error updating subscription status", updateError);
        log("Error details", JSON.stringify(updateError));
      } else {
        log("Successfully updated subscription status in database");
      }
    } else {
      // Create a record showing no subscription
      log("Creating subscription record with inactive status");
      const { error: insertError } = await supabaseAdmin
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          is_subscribed: false,
          subscription_status: 'inactive',
          trial_start_date: new Date().toISOString(),
          trial_end_date: null,
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        log("Error inserting subscription record", insertError);
        log("Error details", JSON.stringify(insertError));
      } else {
        log("Successfully inserted subscription record into database");
      }
    }
    
    return new Response(JSON.stringify({ 
      subscription: null,
      message: "No active subscription found" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    log("Unhandled error", error.message);
    log("Error stack", error.stack);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
