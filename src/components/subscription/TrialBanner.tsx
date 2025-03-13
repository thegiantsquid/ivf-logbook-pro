
import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Timer } from 'lucide-react';

export const TrialBanner = () => {
  const { isInTrialPeriod, trialEndsAt } = useSubscription();

  if (!isInTrialPeriod || !trialEndsAt) return null;

  const now = new Date();
  const trialEnd = new Date(trialEndsAt);
  const totalTrialDays = 14;
  const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const progress = Math.max(0, Math.min(100, ((totalTrialDays - daysLeft) / totalTrialDays) * 100));

  return (
    <div className="bg-card/80 backdrop-blur-sm p-5 rounded-xl border border-primary/10 shadow-sm mb-6 transition-all duration-300 hover:shadow-md animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10 text-primary animate-pulse-subtle">
            <Timer className="h-4 w-4" />
          </div>
          <h3 className="font-semibold text-sm tracking-tight">Free Trial Period</h3>
        </div>
        <Button 
          asChild 
          variant="outline" 
          size="sm"
          className="transition-all duration-300 hover:scale-105 hover:bg-primary/10 hover:border-primary/20"
        >
          <Link to="/subscribe">Subscribe Now</Link>
        </Button>
      </div>
      <div className="space-y-2">
        <Progress 
          value={progress} 
          className="h-2 bg-secondary/50 overflow-hidden"
        />
        <p className="text-xs text-muted-foreground flex justify-between items-center">
          <span className="animate-slide-in-from-left">
            {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left in your trial
          </span>
          <span className="text-xs text-primary/70 font-medium animate-slide-in-from-right">
            {Math.round(progress)}% complete
          </span>
        </p>
      </div>
    </div>
  );
};
