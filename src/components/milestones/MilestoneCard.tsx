
import React from 'react';
import { MilestoneProgress } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

interface MilestoneCardProps {
  milestone: MilestoneProgress;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone }) => {
  const { procedure, currentCount, nextMilestone, achievements } = milestone;
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!nextMilestone) return 100;
    const previousMilestone = achievements.length > 0 
      ? Math.max(...achievements.map(a => (a.milestoneType?.milestone_count || 0)))
      : 0;
    
    const range = nextMilestone.milestone_count - previousMilestone;
    const progress = currentCount - previousMilestone;
    return Math.min(Math.round((progress / range) * 100), 100);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-base sm:text-lg truncate">{procedure}</span>
          <span className="text-xl font-bold">{currentCount}</span>
        </CardTitle>
        <CardDescription>
          {nextMilestone ? (
            <span>Next milestone: {nextMilestone.milestone_count} {procedure}</span>
          ) : (
            <span>All milestones achieved!</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <Progress value={calculateProgress()} className="h-2" />
          
          <div className="flex flex-wrap gap-2">
            {achievements.map(achievement => (
              <Badge key={achievement.id} variant="secondary" className="flex items-center gap-1">
                <Trophy className="h-3 w-3" />
                {achievement.milestoneType?.badge_name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestoneCard;
