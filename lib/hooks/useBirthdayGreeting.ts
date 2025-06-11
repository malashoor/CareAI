import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { isBirthday } from '@/lib/utils/age';

interface UserProfile {
  id: string;
  name: string;
  date_of_birth: string;
  consent_preferences: {
    date_of_birth_use: boolean;
  };
}

export function useBirthdayGreeting() {
  const [showGreeting, setShowGreeting] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    checkBirthday();
  }, []);

  const checkBirthday = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('name, date_of_birth, consent_preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const userProfile = profile as UserProfile;
      
      // Only show greeting if user has consented to date_of_birth_use
      if (userProfile.consent_preferences?.date_of_birth_use && 
          userProfile.date_of_birth && 
          isBirthday(userProfile.date_of_birth)) {
        setUserName(userProfile.name);
        setShowGreeting(true);
      }
    } catch (error) {
      console.error('Error checking birthday:', error);
    }
  };

  return {
    showGreeting,
    userName,
    onClose: () => setShowGreeting(false),
  };
} 