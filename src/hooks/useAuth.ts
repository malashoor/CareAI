import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { sentryMonitoring } from '../services/sentryMonitoring';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          role: session.user.user_metadata.role || 'user',
          name: session.user.user_metadata.name,
        };
        setUser(userData);
        // Set user context in Sentry
        sentryMonitoring.setUserContext(userData);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            role: session.user.user_metadata.role || 'user',
            name: session.user.user_metadata.name,
          };
          setUser(userData);
          // Set user context in Sentry
          sentryMonitoring.setUserContext(userData);
        } else {
          setUser(null);
          // Clear user context in Sentry
          sentryMonitoring.clearUserContext();
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return {
    user,
    loading,
    signIn,
    signOut,
    isAdmin,
  };
} 