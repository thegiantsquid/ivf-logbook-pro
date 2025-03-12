
import React from 'react';
import { UserAchievement, MilestoneType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AchievementBadgeProps {
  achievement: UserAchievement;
  onClick?: () => void;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  onClick 
}) => {
  const milestone = achievement.milestoneType as MilestoneType;
  const isNew = !achievement.is_seen;
  
  if (!milestone) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isNew ? "default" : "secondary"} 
            className={`flex items-center gap-1 cursor-pointer ${isNew ? 'animate-pulse' : ''}`}
            onClick={onClick}
          >
            <Trophy className="h-3 w-3" />
            {milestone.badge_name}
            {isNew && <span className="ml-1 text-xs">NEW</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm max-w-xs">
            <p className="font-medium">{milestone.badge_name}</p>
            <p>{milestone.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Achieved {formatDistanceToNow(new Date(achievement.achieved_at), { addSuffix: true })}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementBadge;
