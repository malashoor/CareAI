import { supabase } from '@/lib/supabase';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReporting: boolean;
  };
}

export interface NotificationPreferences {
  enabled: boolean;
  types: {
    medication: boolean;
    appointments: boolean;
    refills: boolean;
    claims: boolean;
    healthAlerts: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  voiceReadout: {
    enabled: boolean;
    volume: number;
    speed: number;
    pitch: number;
    language: string;
  };
}

interface PreferencesStore extends UserPreferences {
  setTheme: (theme: UserPreferences['theme']) => void;
  setLanguage: (language: string) => void;
  setNotificationSettings: (settings: Partial<UserPreferences['notifications']>) => void;
  setAccessibilitySettings: (settings: Partial<UserPreferences['accessibility']>) => void;
  setPrivacySettings: (settings: Partial<UserPreferences['privacy']>) => void;
  syncWithServer: () => Promise<void>;
}

interface PreferencesState {
  notificationPreferences: NotificationPreferences;
  setNotificationPreferences: (preferences: NotificationPreferences) => void;
  updateNotificationPreferences: (updates: Partial<NotificationPreferences>) => void;
  syncPreferences: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  notifications: {
    enabled: true,
    sound: true,
    vibration: true,
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
  },
  privacy: {
    analytics: true,
    crashReporting: true,
  },
};

const defaultNotificationPreferences: NotificationPreferences = {
  enabled: true,
  types: {
    medication: true,
    appointments: true,
    refills: true,
    claims: true,
    healthAlerts: true,
  },
  frequency: 'immediate',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
  },
  voiceReadout: {
    enabled: false,
    volume: 1.0,
    speed: 1.0,
    pitch: 1.0,
    language: 'en-US',
  },
};

export const usePreferencesStore = create<PreferencesStore & PreferencesState>()(
  persist(
    (set, get) => ({
      ...defaultPreferences,
      notificationPreferences: defaultNotificationPreferences,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setNotificationSettings: (settings) =>
        set((state) => ({
          notifications: { ...state.notifications, ...settings },
        })),
      setAccessibilitySettings: (settings) =>
        set((state) => ({
          accessibility: { ...state.accessibility, ...settings },
        })),
      setPrivacySettings: (settings) =>
        set((state) => ({
          privacy: { ...state.privacy, ...settings },
        })),
      setNotificationPreferences: (preferences) => {
        set({ notificationPreferences: preferences });
        get().syncPreferences();
      },
      updateNotificationPreferences: (updates) => {
        set((state) => ({
          notificationPreferences: {
            ...state.notificationPreferences,
            ...updates,
          },
        }));
        get().syncPreferences();
      },
      syncPreferences: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: serverPrefs } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (serverPrefs) {
          set(serverPrefs.preferences);
        } else {
          const { error } = await supabase
            .from('user_preferences')
            .insert({
              user_id: user.id,
              preferences: get(),
            });
          if (error) console.error('Error syncing preferences:', error);
        }
      },
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.syncPreferences();
        }
      },
    }
  )
); 