import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@supabase/supabase-js';

interface UserMetadata {
  is_admin?: boolean;
}

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.replace('/login');
      return;
    }

    // Check if user has admin access
    const userWithMetadata = user as unknown as User & { user_metadata: UserMetadata };
    if (user && !userWithMetadata.user_metadata?.is_admin) {
      // Redirect to home if not admin
      router.replace('/');
      return;
    }
  }, [user, loading, segments]);

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="tabs" />
    </Stack>
  );
} 