
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { toast } from '@/lib/toast';
import { MilestoneType, UserAchievement, MilestoneProgress } from '@/types';
import { useRecords } from './useRecords';

export const useMilestones = () => {
  const { currentUser } = useAuth();
  const { records } = useRecords();
  const [milestoneTypes, setMilestoneTypes] = useState<MilestoneType[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAchievements, setNewAchievements] = useState<UserAchievement[]>([]);

  // Fetch milestone types
  const fetchMilestoneTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('milestone_types')
        .select('*')
        .order('procedure', { ascending: true })
        .order('milestone_count', { ascending: true });
        
      if (error) throw error;
      
      setMilestoneTypes(data as MilestoneType[]);
    } catch (error: any) {
      handleSupabaseError(error);
    }
  };

  // Fetch user achievements
  const fetchUserAchievements = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          milestoneType:milestone_type_id(*)
        `)
        .eq('user_id', currentUser.uid);
        
      if (error) throw error;
      
      setUserAchievements(data as UserAchievement[]);
    } catch (error: any) {
      handleSupabaseError(error);
    } finally {
      setLoading(false);
    }
  };

  // Mark achievements as seen
  const markAchievementAsSeen = async (achievementId: string) => {
    if (!currentUser) return;
    
    try {
      const { error } = await supabase
        .from('user_achievements')
        .update({ is_seen: true })
        .eq('id', achievementId)
        .eq('user_id', currentUser.uid);
        
      if (error) throw error;
      
      // Update local state
      setUserAchievements(prevAchievements => 
        prevAchievements.map(achievement => 
          achievement.id === achievementId 
            ? { ...achievement, is_seen: true } 
            : achievement
        )
      );
      
      // Remove from new achievements
      setNewAchievements(prev => prev.filter(a => a.id !== achievementId));
    } catch (error: any) {
      handleSupabaseError(error);
    }
  };

  // Calculate procedure counts from records
  const procedureCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    records.forEach(record => {
      const procedure = record.procedure;
      if (procedure) {
        counts[procedure] = (counts[procedure] || 0) + 1;
      }
    });
    
    return counts;
  }, [records]);

  // Check and award new achievements
  const checkForNewAchievements = async () => {
    if (!currentUser || !milestoneTypes.length) return;
    
    const newAchievementsToAdd: Omit<UserAchievement, 'id' | 'achieved_at'>[] = [];
    const achievedMilestoneTypeIds = userAchievements.map(a => a.milestone_type_id);
    
    // Check each procedure count against milestone types
    Object.entries(procedureCounts).forEach(([procedure, count]) => {
      // Find matching milestone types for this procedure
      const matchingMilestones = milestoneTypes
        .filter(mt => mt.procedure === procedure && mt.milestone_count <= count);
      
      // Check which milestones have been achieved but not yet recorded
      matchingMilestones.forEach(milestone => {
        if (!achievedMilestoneTypeIds.includes(milestone.id)) {
          newAchievementsToAdd.push({
            user_id: currentUser.uid,
            milestone_type_id: milestone.id,
            is_seen: false,
            milestoneType: milestone
          });
        }
      });
    });
    
    // If there are new achievements, add them to the database
    if (newAchievementsToAdd.length > 0) {
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .insert(newAchievementsToAdd)
          .select(`
            *,
            milestoneType:milestone_type_id(*)
          `);
          
        if (error) throw error;
        
        // Update local state with new achievements
        if (data && data.length > 0) {
          const newAchievements = data as UserAchievement[];
          setUserAchievements(prev => [...prev, ...newAchievements]);
          setNewAchievements(newAchievements);
          
          // Show toast notifications for each new achievement
          newAchievements.forEach(achievement => {
            const milestone = achievement.milestoneType as MilestoneType;
            toast.success(`🏆 Achievement Unlocked: ${milestone.badge_name}`);
          });
        }
      } catch (error: any) {
        handleSupabaseError(error);
      }
    }
  };

  // Calculate milestone progress for each procedure
  const milestoneProgress = useMemo(() => {
    if (!milestoneTypes.length) return [];
    
    const progress: MilestoneProgress[] = [];
    
    // For each procedure with records
    Object.entries(procedureCounts).forEach(([procedure, count]) => {
      // Find all milestone types for this procedure
      const procedureMilestones = milestoneTypes
        .filter(mt => mt.procedure === procedure)
        .sort((a, b) => a.milestone_count - b.milestone_count);
      
      // Find the next milestone to achieve
      const nextMilestone = procedureMilestones.find(mt => mt.milestone_count > count);
      
      // Find achievements for this procedure
      const procedureAchievements = userAchievements.filter(ua => {
        const mt = ua.milestoneType as MilestoneType;
        return mt && mt.procedure === procedure;
      });
      
      progress.push({
        procedure,
        currentCount: count,
        nextMilestone,
        achievements: procedureAchievements
      });
    });
    
    // Sort by procedures with the most completions first
    return progress.sort((a, b) => b.currentCount - a.currentCount);
  }, [procedureCounts, milestoneTypes, userAchievements]);

  // Initial fetch
  useEffect(() => {
    fetchMilestoneTypes();
  }, []);
  
  useEffect(() => {
    if (currentUser) {
      fetchUserAchievements();
    }
  }, [currentUser]);
  
  // Check for new achievements whenever records or milestone types change
  useEffect(() => {
    if (records.length && milestoneTypes.length && userAchievements !== null) {
      checkForNewAchievements();
    }
  }, [records, milestoneTypes, currentUser]);

  return {
    milestoneTypes,
    userAchievements,
    newAchievements,
    milestoneProgress,
    loading,
    markAchievementAsSeen
  };
};
