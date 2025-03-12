
import React from 'react';
import { useMilestones } from '@/hooks/useMilestones';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import MilestoneCard from './MilestoneCard';
import { Trophy } from 'lucide-react';

const MilestoneProgress: React.FC = () => {
  const { milestoneProgress, loading } = useMilestones();
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-[150px] w-full rounded-lg" />
          <Skeleton className="h-[150px] w-full rounded-lg" />
        </div>
      </div>
    );
  }
  
  if (!milestoneProgress.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
          <CardDescription>
            Track your progress towards procedural milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No procedures recorded yet</p>
            <p className="text-sm">Add records to start tracking milestones</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Your Milestone Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestoneProgress.slice(0, 6).map((milestone, index) => (
            <MilestoneCard key={index} milestone={milestone} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MilestoneProgress;
