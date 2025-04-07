
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

        if (error) {
          console.error('Error calling check-subscription function:', error);
          throw error;
        }

        setStatus({
          isLoading: false,
          hasActiveSubscription: data.subscribed,
          isInTrialPeriod: data.isInTrial,
          trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null,
        });
      } catch (error) {
        console.error('Error checking subscription:', error);
        
        // Fallback to database check
        try {
          console.log('Falling back to database check for subscription');
          const { data: subscription, error } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', currentUser.uid)
            .maybeSingle();

          if (error) {
            console.error('Error with database fallback:', error);
            throw error;
          }

          if (!subscription) {
            console.log('No subscription found in database');
            setStatus({
              isLoading: false,
              hasActiveSubscription: false,
              isInTrialPeriod: false,
              trialEndsAt: null,
            });
            return;
          }

          const now = new Date();
          const trialEndDate = subscription.trial_end_date ? new Date(subscription.trial_end_date) : null;
          const isInTrial = trialEndDate && now < trialEndDate;
          const hasActiveSubscription = subscription.is_subscribed && 
            (!subscription.subscription_end_date || new Date(subscription.subscription_end_date) > now);

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
          });
        } catch (dbError) {
          console.error('Error with database fallback:', dbError);
          toast.error('Failed to check subscription status');
          setStatus(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    checkSubscriptionStatus();
  }, [currentUser]);

  return status;
};
