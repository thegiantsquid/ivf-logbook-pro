
import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, Calendar, Award, FileEdit, FileSearch } from 'lucide-react';

const Subscribe = () => {
  const { hasActiveSubscription, isInTrialPeriod, trialEndsAt } = useSubscription();
  
  const features = [
    { icon: FileEdit, text: "Add unlimited IVF procedure records" },
    { icon: FileSearch, text: "Advanced search and filtering" },
    { icon: Calendar, text: "Comprehensive procedure timeline" },
    { icon: Award, text: "Export reports and analytics" },
    { icon: Star, text: "Priority support" }
  ];

  const handleSubscribe = async () => {
    // TODO: Implement Stripe integration
    console.log('Subscribe clicked');
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Upgrade to Pro</h1>
        <p className="text-muted-foreground mt-2">
          Get full access to all features and continue tracking your IVF procedures
        </p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Professional Plan</CardTitle>
          <CardDescription>Perfect for medical professionals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">$19</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubscribe} className="w-full" size="lg">
            {hasActiveSubscription 
              ? 'Already Subscribed' 
              : isInTrialPeriod 
                ? 'Subscribe Now' 
                : 'Reactivate Subscription'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Subscribe;
