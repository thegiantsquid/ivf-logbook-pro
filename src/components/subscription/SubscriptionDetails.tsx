
import React, { useEffect, useState } from 'react';
import { CalendarClock, CheckCircle, Info, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface SubscriptionData {
  currentPeriodEnd?: string;
  nextInvoice?: string;
  status?: string;
}

export const SubscriptionDetails = () => {
  const { hasActiveSubscription, isInTrialPeriod, trialEndsAt, isLoading } = useSubscription();
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (hasActiveSubscription) {
        setLoadingDetails(true);
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) return;
          
          const { data, error } = await supabase.functions.invoke('subscription-details', {
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });
          
          if (error) throw error;
          
          if (data && data.subscription) {
            setSubscriptionData({
              currentPeriodEnd: data.subscription.current_period_end,
              nextInvoice: data.subscription.current_period_end,
              status: data.subscription.status
            });
            
            console.log("Subscription details fetched:", data.subscription);
          }
        } catch (error) {
          console.error('Error fetching subscription details:', error);
          // Fallback to estimation
          const estimatedNextDate = new Date();
          estimatedNextDate.setDate(estimatedNextDate.getDate() + 30);
          setSubscriptionData({
            currentPeriodEnd: estimatedNextDate.toISOString(),
            nextInvoice: estimatedNextDate.toISOString(),
            status: 'active'
          });
        } finally {
          setLoadingDetails(false);
        }
      }
    };

    fetchSubscriptionDetails();
  }, [hasActiveSubscription]);

  if (isLoading || loadingDetails) {
    return (
      <Card className="border-primary/10 animate-pulse bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-card-foreground">Loading subscription info...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (hasActiveSubscription) {
    return (
      <Card className="border-primary/10 bg-card hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg text-card-foreground">Active Subscription</CardTitle>
          </div>
          <CardDescription className="text-card-foreground/80">You have full access to all premium features</CardDescription>
        </CardHeader>
        <CardContent className="pb-2 space-y-3">
          <div className="flex items-center gap-2 text-sm text-card-foreground/80">
            <ShieldCheck className="h-4 w-4" />
            <span>Your subscription is active and will automatically renew</span>
          </div>
          
          {subscriptionData.currentPeriodEnd && (
            <div className="text-sm border-t border-border/60 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-card-foreground/70">Current period ends:</span>
                <span className="font-medium text-card-foreground">
                  {format(new Date(subscriptionData.currentPeriodEnd), 'MMM dd, yyyy')}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <span className="text-card-foreground/70">Next payment:</span>
                <span className="font-medium text-card-foreground">
                  {format(new Date(subscriptionData.nextInvoice || subscriptionData.currentPeriodEnd), 'MMM dd, yyyy')}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-1">
                <span className="text-card-foreground/70">Status:</span>
                <span className="font-medium text-green-600 capitalize">
                  {subscriptionData.status || 'active'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button asChild variant="outline" size="sm">
            <Link to="/subscription">Manage Subscription</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/subscribe">View Plan Details</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (isInTrialPeriod && trialEndsAt) {
    const daysLeft = Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
    
    return (
      <Card className={cn(
        "border-primary/10 bg-card hover:shadow-md transition-all",
        daysLeft <= 3 ? "border-orange-300/30" : ""
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CalendarClock className={cn(
              "h-5 w-5",
              daysLeft <= 3 ? "text-orange-500" : "text-primary"
            )} />
            <CardTitle className="text-lg text-card-foreground">Trial Period</CardTitle>
          </div>
          <CardDescription className="text-card-foreground/80">
            Your trial {daysLeft > 0 ? `ends in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}` : 'has ended'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center gap-2 text-sm text-card-foreground/80">
            <Info className="h-4 w-4" />
            <span>
              {daysLeft > 0 
                ? `Trial expires on ${format(new Date(trialEndsAt), 'MMM dd, yyyy')}`
                : 'Your trial period has ended. Subscribe to continue using premium features.'
              }
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full" size="sm">
            <Link to="/subscribe">Subscribe Now</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/20 bg-card hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-lg text-card-foreground">No Active Subscription</CardTitle>
        </div>
        <CardDescription className="text-card-foreground/80">Subscribe to unlock all premium features</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-2 text-sm text-card-foreground/80">
          <Info className="h-4 w-4" />
          <span>Your trial period has ended or you haven't subscribed yet</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" size="sm">
          <Link to="/subscribe">Subscribe Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
