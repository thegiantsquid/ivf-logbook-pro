
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!currentUser) {
        setStatus(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          console.log("No active session found");
          setStatus(prev => ({ ...prev, isLoading: false, error: "No active session" }));
          return;
        }
        
        console.log("Calling subscription-details function");
        // Call our edge function to check subscription
        const { data, error } = await supabase.functions.invoke('subscription-details', {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`
          }
        });

        console.log("subscription-details response:", data, error);
        
        if (error) {
          console.error('Error calling subscription-details function:', error);
          throw error;
        }

        if (data.error) {
          console.log("Function returned error:", data.error);
          // No need to throw here, we'll handle the DB fallback
        }

        if (data.subscription) {
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
          .eq('user_id', currentUser.uid)
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
        toast.error('Failed to check subscription status');
        setStatus(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }));
      }
    };

    checkSubscriptionStatus();
  }, [currentUser]);

  return status;
};
