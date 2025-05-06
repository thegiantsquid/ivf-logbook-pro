
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  try {
    // Get the user data from the auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user) {
      throw new Error('No user found');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const email = user.email;

    if (!email) {
      throw new Error('No email found');
    }

    // Specific product ID provided by user
    const PRODUCT_ID = 'prod_S3BoOl5xVZ5E37';

    // Get the price associated with this product
    const prices = await stripe.prices.list({
      product: PRODUCT_ID,
      active: true,
      limit: 1
    });

    if (prices.data.length === 0) {
      throw new Error('No active price found for the product');
    }

    const price_id = prices.data[0].id;

    // Get customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ 
          subscribed: false,
          trialEndsAt: null
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 10
    });

    // Check if any subscription has the specific price
    const hasSubscription = subscriptions.data.some(sub => 
      sub.items.data.some(item => item.price.id === price_id)
    );

    // Also get user's trial data from Supabase
    const { data: userData, error: userError } = await supabaseClient
      .from('user_subscriptions')
      .select('trial_end_date')
      .eq('user_id', user.id)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user trial data:', userError);
    }

    const trialEndsAt = userData?.trial_end_date ? new Date(userData.trial_end_date) : null;
    const now = new Date();
    const isInTrial = trialEndsAt ? now < trialEndsAt : false;

    return new Response(
      JSON.stringify({ 
        subscribed: hasSubscription,
        isInTrial: isInTrial,
        trialEndsAt: trialEndsAt
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error checking subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
