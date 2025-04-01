
import React from 'react';
import { CalendarClock, CheckCircle, Info, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export const SubscriptionDetails = () => {
  const { hasActiveSubscription, isInTrialPeriod, trialEndsAt, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <Card className="border-primary/10 animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Loading subscription info...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (hasActiveSubscription) {
    return (
      <Card className="border-primary/10 bg-card/80 hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Active Subscription</CardTitle>
          </div>
          <CardDescription>You have full access to all premium features</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            <span>Your subscription is active and will automatically renew</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button asChild variant="outline" size="sm">
            <Link to="/settings">Manage Subscription</Link>
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
        "border-primary/10 bg-card/80 hover:shadow-md transition-all",
        daysLeft <= 3 ? "border-orange-300/30" : ""
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CalendarClock className={cn(
              "h-5 w-5",
              daysLeft <= 3 ? "text-orange-500" : "text-primary"
            )} />
            <CardTitle className="text-lg">Trial Period</CardTitle>
          </div>
          <CardDescription>
            Your trial {daysLeft > 0 ? `ends in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}` : 'has ended'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
    <Card className="border-destructive/20 bg-card/80 hover:shadow-md transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-lg">No Active Subscription</CardTitle>
        </div>
        <CardDescription>Subscribe to unlock all premium features</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
