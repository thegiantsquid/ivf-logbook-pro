
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';

interface SubscriptionStatus {
  isLoading: boolean;
  hasActiveSubscription: boolean;
  isInTrialPeriod: boolean;
  trialEndsAt: Date | null;
}

export const useSubscription = () => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isLoading: true,
    hasActiveSubscription: false,
    isInTrialPeriod: false,
    trialEndsAt: null,
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
          setStatus(prev => ({ ...prev, isLoading: false }));
          return;
        }
        
        // Call our edge function to check subscription
        const { data, error } = await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.session.access_token}`
          }
        });

        if (error) throw error;

        setStatus({
          isLoading: false,
          hasActiveSubscription: data.subscribed,
          isInTrialPeriod: data.isInTrial,
          trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null,
        });
      } catch (error) {
        console.error('Error checking subscription:', error);
        toast.error('Failed to check subscription status');
        
        // Fallback to database check
        try {
          const { data: subscription, error } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', currentUser.uid)
            .maybeSingle();

          if (error) throw error;

          if (!subscription) {
            setStatus({
              isLoading: false,
              hasActiveSubscription: false,
              isInTrialPeriod: false,
              trialEndsAt: null,
            });
            return;
          }

          const now = new Date();
          const trialEndDate = new Date(subscription.trial_end_date);
          const isInTrial = now < trialEndDate;
          const hasActiveSubscription = subscription.is_subscribed && 
            (!subscription.subscription_end_date || new Date(subscription.subscription_end_date) > now);

          setStatus({
            isLoading: false,
            hasActiveSubscription,
            isInTrialPeriod: isInTrial,
            trialEndsAt: trialEndDate,
          });
        } catch (dbError) {
          console.error('Error with database fallback:', dbError);
          setStatus(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    checkSubscriptionStatus();
  }, [currentUser]);

  return status;
};
