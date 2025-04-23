
import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Star, Calendar, Award, FileEdit, FileSearch, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Subscribe = () => {
  const { hasActiveSubscription, isInTrialPeriod, trialEndsAt, refreshSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check URL parameters for subscription status
  useEffect(() => {
    const subscriptionStatus = searchParams.get('subscription');
    
    if (subscriptionStatus === 'success') {
      toast.success('Thank you for subscribing! Processing your subscription...');
      // Force refresh subscription status after successful checkout
      refreshSubscription();
    } else if (subscriptionStatus === 'canceled') {
      toast.info('Subscription process canceled');
    }
  }, [searchParams, refreshSubscription]);
  
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
        navigate('/login');
        return;
      }
      
      toast.info('Preparing checkout...');
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) {
        console.error('Error from edge function:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }
      
      if (!data || !data.url) {
        throw new Error('No checkout URL returned from server');
      }
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create checkout session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card className="w-full border border-primary/10 bg-card shadow-sm hover:shadow-md transition-all">
        <CardHeader className="border-b border-border/60 pb-6">
          <CardTitle className="text-2xl text-card-foreground">Professional Plan</CardTitle>
          <CardDescription className="text-card-foreground/80">Perfect for medical professionals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">$19</span>
            <span className="text-card-foreground/70">/month</span>
          </div>
          
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-card-foreground">{feature.text}</span>
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
