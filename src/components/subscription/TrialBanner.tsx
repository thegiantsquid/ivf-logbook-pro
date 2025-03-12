
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
    <div className="bg-card p-4 rounded-lg border shadow-sm mb-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Free Trial Period</h3>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/subscribe">Subscribe Now</Link>
        </Button>
      </div>
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground">
          {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left in your trial
        </p>
      </div>
    </div>
  );
};
