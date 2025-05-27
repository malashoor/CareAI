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

// Fallback configuration if database is empty or fails
const FALLBACK_TABS: Record<string, TabConfig[]> = {
  senior: [
    { name: 'index', title: 'Home', icon: 'home', order: 1, roles: ['senior'], isEnabled: true },
    { name: 'health', title: 'Health', icon: 'heart', order: 2, roles: ['senior'], isEnabled: true },
    { name: 'cognitive', title: 'Mind', icon: 'brain', order: 3, roles: ['senior'], isEnabled: true },
    { name: 'monitoring', title: 'Safety', icon: 'shield', order: 4, roles: ['senior'], isEnabled: true },
    { name: 'settings', title: 'Settings', icon: 'settings', order: 5, roles: ['senior'], isEnabled: true },
  ],
  child: [
    { name: 'index', title: 'Overview', icon: 'activity', order: 1, roles: ['child'], isEnabled: true },
    { name: 'monitoring', title: 'Monitor', icon: 'shield', order: 2, roles: ['child'], isEnabled: true },
    { name: 'chat', title: 'Messages', icon: 'message-square', order: 3, roles: ['child'], isEnabled: true },
    { name: 'alerts', title: 'Alerts', icon: 'bell', order: 4, roles: ['child'], isEnabled: true },
    { name: 'settings', title: 'Settings', icon: 'settings', order: 5, roles: ['child'], isEnabled: true },
  ],
  medical: [
    { name: 'index', title: 'Dashboard', icon: 'stethoscope', order: 1, roles: ['medical'], isEnabled: true },
    { name: 'appointments', title: 'Schedule', icon: 'calendar', order: 2, roles: ['medical'], isEnabled: true },
    { name: 'patients', title: 'Patients', icon: 'users', order: 3, roles: ['medical'], isEnabled: true },
    { name: 'chat', title: 'Consult', icon: 'message-square', order: 4, roles: ['medical'], isEnabled: true },
    { name: 'settings', title: 'Settings', icon: 'settings', order: 5, roles: ['medical'], isEnabled: true },
  ],
};

export function useTabConfig() {
  const { user } = useAuth();
  const [tabs, setTabs] = useState<TabConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    async function fetchTabConfig() {
      if (!user?.role) {
        setLoading(false);
        return;
      }

      console.log('🔧 Loading tab configuration for role:', user.role);

      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('tab_configurations')
          .select('*')
          .eq('isEnabled', true)
          .order('order', { ascending: true });

        if (supabaseError) {
          console.error('❌ Supabase error:', supabaseError);
          throw supabaseError;
        }

        console.log('📊 Raw tab data from database:', data);

        // Filter tabs based on user role
        let roleTabs = data ? data.filter(tab => 
          tab.roles && Array.isArray(tab.roles) && tab.roles.includes(user.role)
        ) : [];

        console.log('🎯 Filtered tabs for role:', user.role, roleTabs);

        // If no tabs found for role or database is empty, use fallback
        if (roleTabs.length === 0) {
          console.log('⚠️ No tabs found in database, using fallback configuration');
          roleTabs = FALLBACK_TABS[user.role] || [];
          setUsingFallback(true);
        } else {
          setUsingFallback(false);
        }

        // Ensure maximum 5 tabs (tab bar best practice)
        if (roleTabs.length > 5) {
          console.warn(`🚨 Too many tabs (${roleTabs.length}) for role ${user.role}, limiting to 5`);
          roleTabs = roleTabs.slice(0, 5);
        }

        // Remove duplicates based on name
        const uniqueTabs = roleTabs.filter((tab, index, self) =>
          index === self.findIndex(t => t.name === tab.name)
        );

        if (uniqueTabs.length !== roleTabs.length) {
          console.warn('🔄 Removed duplicate tabs');
        }

        console.log('✅ Final tabs configuration:', uniqueTabs);
        setTabs(uniqueTabs);

      } catch (err) {
        console.error('❌ Error fetching tab configuration:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load tabs';
        setError(errorMessage);
        
        // Use fallback on error
        const fallbackTabs = FALLBACK_TABS[user.role] || [];
        console.log('🔄 Using fallback tabs due to error:', fallbackTabs);
        setTabs(fallbackTabs);
        setUsingFallback(true);
        
      } finally {
        setLoading(false);
      }
    }

    fetchTabConfig();
  }, [user?.role]);

  // Retry function for failed loads
  const retry = () => {
    if (user?.role) {
      fetchTabConfig();
    }
  };

  const isTabActive = (tabName: string) => {
    return tabs.some(tab => tab.name === tabName);
  };

  const getTabByName = (tabName: string) => {
    return tabs.find(tab => tab.name === tabName);
  };

  return {
    tabs,
    loading,
    error,
    usingFallback,
    retry,
    isTabActive,
    getTabByName,
    debug: {
      userRole: user?.role,
      tabCount: tabs.length,
      tabNames: tabs.map(t => t.name),
    }
  };
}

// Helper function to validate tab configuration
export function validateTabConfig(tabs: TabConfig[]): string[] {
  const errors: string[] = [];

  if (tabs.length === 0) {
    errors.push('No tabs configured');
  }

  if (tabs.length > 5) {
    errors.push(`Too many tabs (${tabs.length}). Maximum recommended is 5.`);
  }

  const duplicateNames = tabs
    .map(tab => tab.name)
    .filter((name, index, arr) => arr.indexOf(name) !== index);

  if (duplicateNames.length > 0) {
    errors.push(`Duplicate tab names: ${duplicateNames.join(', ')}`);
  }

  const missingIcons = tabs.filter(tab => !tab.icon);
  if (missingIcons.length > 0) {
    errors.push(`Tabs missing icons: ${missingIcons.map(t => t.name).join(', ')}`);
  }

  return errors;
} 