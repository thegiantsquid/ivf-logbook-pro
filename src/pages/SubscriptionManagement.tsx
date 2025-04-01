
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Calendar, BarChart2, FileText, Clock, Loader2 } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { format } from 'date-fns';
import { SubscriptionDetails } from '@/components/subscription/SubscriptionDetails';

const SubscriptionManagement = () => {
  const { hasActiveSubscription, isInTrialPeriod, trialEndsAt, isLoading } = useSubscription();
  const [isCancelling, setIsCancelling] = useState(false);
  
  const features = [
    { icon: FileText, text: "Unlimited IVF procedure records" },
    { icon: BarChart2, text: "Advanced analytics and reporting" },
    { icon: Calendar, text: "Full procedure timeline access" },
    { icon: Clock, text: "Priority support response" },
  ];
  
  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to manage subscriptions');
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      if (data.canceled) {
        toast.success('Your subscription has been canceled');
      } else {
        toast.error('Failed to cancel subscription: ' + data.message);
      }
      
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your IVF Logbook Pro subscription
          </p>
        </div>
        
        <SubscriptionDetails />
        
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              Professional subscription with all premium features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold">$19/month</span>
                <Badge variant="secondary">Professional</Badge>
              </div>
              
              {hasActiveSubscription && (
                <Badge variant="outline" className="text-green-500 bg-green-50 dark:bg-green-900/10">
                  Active
                </Badge>
              )}
              
              {isInTrialPeriod && trialEndsAt && (
                <Badge variant="outline" className="text-primary bg-primary/5">
                  Trial ends {format(new Date(trialEndsAt), 'MMM dd, yyyy')}
                </Badge>
              )}
              
              {!hasActiveSubscription && !isInTrialPeriod && (
                <Badge variant="outline" className="text-destructive bg-destructive/5">
                  Inactive
                </Badge>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h3 className="font-medium">Features included:</h3>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            {hasActiveSubscription ? (
              <>
                <Button variant="outline" disabled={isCancelling} onClick={handleCancelSubscription}>
                  {isCancelling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Cancel Subscription'
                  )}
                </Button>
                <Button variant="secondary" onClick={() => window.location.href = "https://billing.stripe.com/p/login/test_28o00n8RV0sT0aA5kk"}>
                  Manage Billing
                </Button>
              </>
            ) : (
              <Button onClick={() => window.location.href = "/subscribe"} className="w-full sm:w-auto">
                Subscribe Now
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
