import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

export interface TabConfig {
  name: string;
  title: string;
  icon: string;
  order: number;
  roles: string[];
  isEnabled: boolean;
}

export function useTabConfig() {
  const { user } = useAuth();
  const [tabs, setTabs] = useState<TabConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTabConfig() {
      if (!user?.role) return;

      try {
        const { data, error } = await supabase
          .from('tab_configurations')
          .select('*')
          .eq('isEnabled', true)
          .order('order', { ascending: true });

        if (error) throw error;

        // Filter tabs based on user role
        const roleTabs = data.filter(tab => 
          tab.roles.includes(user.role)
        );

        setTabs(roleTabs);
      } catch (err) {
        console.error('Error fetching tab configuration:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tabs');
      } finally {
        setLoading(false);
      }
    }

    fetchTabConfig();
  }, [user?.role]);

  return {
    tabs,
    loading,
    error
  };
} 