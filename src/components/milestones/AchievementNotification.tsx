
import React from 'react';
import { UserAchievement, MilestoneType } from '@/types';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, X } from 'lucide-react';

interface AchievementNotificationProps {
  achievement: UserAchievement;
  onDismiss: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ 
  achievement, 
  onDismiss 
}) => {
  const milestone = achievement.milestoneType as MilestoneType;
  
  if (!milestone) return null;
  
  return (
    <Card className="border-primary/20 shadow-md relative overflow-hidden">
      <div className="absolute top-2 right-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <CardTitle className="text-base">
            Achievement Unlocked!
          </CardTitle>
        </div>
        <CardDescription>
          {milestone.badge_name}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <p className="text-sm">{milestone.description}</p>
        
        <div className="mt-2 text-sm text-muted-foreground">
          <p>
            You've performed {milestone.milestone_count} {milestone.procedure}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementNotification;
