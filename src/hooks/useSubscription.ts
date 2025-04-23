
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';

interface SubscriptionStatus {
  isLoading: boolean;
  hasActiveSubscription: boolean;
  isInTrialPeriod: boolean;
  trialEndsAt: Date | null;
  error: string | null;
}

export const useSubscription = () => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isLoading: true,
    hasActiveSubscription: false,
    isInTrialPeriod: false,
    trialEndsAt: null,
    error: null
  });

  const checkSubscriptionStatus = useCallback(async () => {
    if (!currentUser) {
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // First, get the current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting session:", sessionError);
        throw sessionError;
      }
      
      if (!sessionData.session) {
        console.log("No active session found");
        setStatus(prev => ({ ...prev, isLoading: false, error: "No active session" }));
        return;
      }
      
      // Use the most recent session available
      const session = sessionData.session;
      
      console.log("Calling subscription-details function with token:", session.access_token.substring(0, 10) + "...");
      
      // Call our edge function to check subscription with fresh token
      const { data, error } = await supabase.functions.invoke('subscription-details', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      console.log("subscription-details response:", data, error);
      
      if (error) {
        console.error('Error calling subscription-details function:', error);
        // Continue to fallback instead of throwing
      }

      if (data && data.error) {
        console.log("Function returned error:", data.error);
        // No need to throw here, we'll handle the DB fallback
      }

      if (data && data.subscription) {
        console.log("Subscription details received:", data.subscription);
        // Process subscription data from the function
        setStatus({
          isLoading: false,
          hasActiveSubscription: data.subscription.status === 'active',
          isInTrialPeriod: false, // Stripe doesn't directly expose trial status in this response
          trialEndsAt: null,
          error: null
        });
        return;
      }

      console.log("No subscription details, falling back to database check");
      // Fallback to database check
      const { data: subscription, error: dbError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (dbError) {
        console.error('Error with database subscription check:', dbError);
        throw dbError;
      }

      if (!subscription) {
        console.log('No subscription found in database');
        setStatus({
          isLoading: false,
          hasActiveSubscription: false,
          isInTrialPeriod: false,
          trialEndsAt: null,
          error: null
        });
        return;
      }

      console.log("Subscription found in database:", subscription);
      const now = new Date();
      const trialEndDate = subscription.trial_end_date ? new Date(subscription.trial_end_date) : null;
      const isInTrial = trialEndDate && now < trialEndDate;
      const hasActiveSubscription = subscription.is_subscribed && 
        (subscription.subscription_status === 'active' || 
        (!subscription.subscription_end_date || new Date(subscription.subscription_end_date) > now));

      console.log('Database subscription status:', { 
        isInTrial, 
        hasActiveSubscription, 
        is_subscribed: subscription.is_subscribed,
        subscription_status: subscription.subscription_status
      });

      setStatus({
        isLoading: false,
        hasActiveSubscription,
        isInTrialPeriod: isInTrial,
        trialEndsAt: trialEndDate,
        error: null
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      // Don't show toast error for subscription check as it's not critical
      // toast.error('Failed to check subscription status');
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [currentUser]);

  // Initial check on component mount or when user changes
  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  // Function to manually refresh the subscription status
  const refreshSubscription = useCallback(async () => {
    console.log("Manually refreshing subscription status");
    setStatus(prev => ({ ...prev, isLoading: true }));
    await checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  return { 
    ...status, 
    refreshSubscription
  };
};
