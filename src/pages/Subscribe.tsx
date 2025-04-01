
import React, { useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, Calendar, Award, FileEdit, FileSearch, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';

const Subscribe = () => {
  const { hasActiveSubscription, isInTrialPeriod, trialEndsAt } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  
  const features = [
    { icon: FileEdit, text: "Add unlimited IVF procedure records" },
    { icon: FileSearch, text: "Advanced search and filtering" },
    { icon: Calendar, text: "Comprehensive procedure timeline" },
    { icon: Award, text: "Export reports and analytics" },
    { icon: Star, text: "Priority support" }
  ];

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('You must be logged in to subscribe');
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Upgrade to Pro</h1>
        <p className="text-muted-foreground mt-2">
          Get full access to all features and continue tracking your IVF procedures
        </p>
      </div>

      <Card className="w-full border-gray-100 shadow-md">
        <CardHeader className="border-b pb-6">
          <CardTitle className="text-2xl">Professional Plan</CardTitle>
          <CardDescription>Perfect for medical professionals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">$19</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{feature.text}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="pt-2">
          <Button 
            onClick={handleSubscribe} 
            className="w-full" 
            size="lg"
            disabled={isLoading || hasActiveSubscription}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : hasActiveSubscription ? (
              'Already Subscribed'
            ) : isInTrialPeriod ? (
              'Subscribe Now'
            ) : (
              'Reactivate Subscription'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Subscribe;
