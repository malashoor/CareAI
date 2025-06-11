import { supabase } from '@/lib/supabase';
import { calculateAge } from './age';

export interface AgeGroup {
  label: string;
  min: number;
  max: number;
}

export const AGE_GROUPS: AgeGroup[] = [
  { label: '40-49', min: 40, max: 49 },
  { label: '50-59', min: 50, max: 59 },
  { label: '60-69', min: 60, max: 69 },
  { label: '70-79', min: 70, max: 79 },
  { label: '80+', min: 80, max: 120 },
];

export interface AgeGroupStats {
  group: string;
  count: number;
  percentage: number;
  totalUsers: number;
}

export async function getAgeGroupDistribution(): Promise<AgeGroupStats[]> {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('date_of_birth')
      .not('date_of_birth', 'is', null);

    if (error) throw error;

    const totalUsers = profiles.length;
    const ageGroups = AGE_GROUPS.map(group => {
      const count = profiles.filter(profile => {
        const age = calculateAge(profile.date_of_birth);
        return age >= group.min && age <= group.max;
      }).length;

      return {
        group: group.label,
        count,
        percentage: (count / totalUsers) * 100,
        totalUsers,
      };
    });

    return ageGroups;
  } catch (error) {
    console.error('Error getting age group distribution:', error);
    throw error;
  }
}

export async function getAgeGroupActivityStats(
  days: number = 30
): Promise<Record<string, number>> {
  try {
    const { data: activities, error } = await supabase
      .from('user_activity_log')
      .select('created_at, user_id')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, date_of_birth');

    const ageGroupActivity: Record<string, number> = {};
    AGE_GROUPS.forEach(group => {
      ageGroupActivity[group.label] = 0;
    });

    activities.forEach(activity => {
      const profile = profiles.find(p => p.id === activity.user_id);
      if (profile?.date_of_birth) {
        const age = calculateAge(profile.date_of_birth);
        const group = AGE_GROUPS.find(g => age >= g.min && age <= g.max);
        if (group) {
          ageGroupActivity[group.label]++;
        }
      }
    });

    return ageGroupActivity;
  } catch (error) {
    console.error('Error getting age group activity stats:', error);
    throw error;
  }
} 