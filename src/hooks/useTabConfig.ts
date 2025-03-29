import { useMemo } from 'react';
import { useAuth } from './useAuth';

export function useTabConfig() {
  const { session } = useAuth();

  return useMemo(() => {
    if (!session) {
      return {
        tabs: [
          {
            name: 'login',
            title: 'Login',
            icon: 'log-in',
          },
        ],
      };
    }

    return {
      tabs: [
        {
          name: 'home',
          title: 'Home',
          icon: 'home',
        },
        {
          name: 'health',
          title: 'Health',
          icon: 'heart',
        },
        {
          name: 'mental',
          title: 'Mental',
          icon: 'brain',
        },
        {
          name: 'profile',
          title: 'Profile',
          icon: 'user',
        },
      ],
    };
  }, [session]);
} 