import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Users, Stethoscope } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';

const roles = [
  {
    id: 'senior',
    title: 'Senior',
    description: 'I want to manage my health and stay connected',
    icon: Heart,
    color: theme.colors.gradients.primary,
    image: 'https://images.unsplash.com/photo-1505685679686-2490cab6217d?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'child',
    title: 'Family Member',
    description: 'I want to monitor and support my loved one',
    icon: Users,
    color: theme.colors.gradients.info,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2000&auto=format&fit=crop'
  },
  {
    id: 'medical',
    title: 'Healthcare Professional',
    description: 'I want to provide care and monitor patients',
    icon: Stethoscope,
    color: theme.colors.gradients.success,
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=2000&auto=format&fit=crop'
  }
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = async (roleId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Validate role
      if (!['senior', 'child', 'medical'].includes(roleId)) {
        throw new Error('Invalid role selected');
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No authenticated user');

      // Check if profile already exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw profileError;
      }

      // If profile exists and has a different role, prevent role change
      if (existingProfile?.role && existingProfile.role !== roleId) {
        throw new Error('Cannot change role once set');
      }

      // Update or create user profile with role
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          role: roleId,
          name: user.user_metadata.name,
          email: user.email,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: 'en',
          features_enabled: {
            health_monitoring: true,
            medication_management: true,
            cognitive_support: true,
            fall_detection: true,
            voice_messaging: true
          }
        })
        .select()
        .single();

      if (updateError) throw updateError;

      // Navigate to main app based on role
      switch (roleId) {
        case 'senior':
          router.replace('/(tabs)/health');
          break;
        case 'child':
          router.replace('/(tabs)/monitoring');
          break;
        case 'medical':
          router.replace('/(tabs)/appointments');
          break;
        default:
          throw new Error('Invalid role after update');
      }

    } catch (err) {
      console.error('Role selection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to set role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>
          Select how you'll be using CareAI to personalize your experience
        </Text>
      </View>

      <View style={styles.roles}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={styles.roleCard}
            onPress={() => handleRoleSelect(role.id)}
            disabled={loading}>
            <Image source={{ uri: role.image }} style={styles.roleImage} />
            <LinearGradient
              colors={role.color}
              style={styles.roleContent}>
              <role.icon color="#FFF" size={32} />
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.secondary,
  },
  roles: {
    padding: 16,
    gap: 16,
  },
  roleCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: theme.colors.background.primary,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  roleImage: {
    width: '100%',
    height: 200,
  },
  roleContent: {
    padding: 24,
  },
  roleTitle: {
    fontSize: 24,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.white,
    marginTop: 12,
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.white,
    opacity: 0.9,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.status.error,
  },
});