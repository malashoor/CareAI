import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';
import DateOfBirthPicker from '../../components/DateOfBirthPicker';
import { isValidDOB } from '@/lib/utils/age';

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateInputs = () => {
    if (!name.trim()) {
      throw new Error('Please enter your name');
    }
    if (!email.trim()) {
      throw new Error('Please enter your email');
    }
    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    if (!dateOfBirth) {
      throw new Error('Please enter your date of birth');
    }
    if (!isValidDOB(dateOfBirth.toISOString())) {
      throw new Error('You must be at least 40 years old to use CareAI');
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate inputs
      validateInputs();

      // Create user account
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
            email: email.trim().toLowerCase()
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Failed to create account');

      // Create initial profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          date_of_birth: dateOfBirth?.toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: 'en',
          consent_preferences: {
            health_data_tracking: true,
            location_tracking: false,
            voice_recording: false,
            sharing_with_family: false,
            sharing_with_professionals: false,
            date_of_birth_use: true,
            last_updated: new Date().toISOString()
          }
        });

      if (profileError) throw profileError;

      // Navigate to role selection
      router.push('/welcome/role-selection');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=2000&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join CareAI to start your care journey</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User color="#FFFFFF" size={20} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor="#FFFFFF80"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail color="#FFFFFF" size={20} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#FFFFFF80"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock color="#FFFFFF" size={20} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#FFFFFF80"
                secureTextEntry
                textContentType="newPassword"
              />
            </View>

            <Text style={styles.passwordHint}>
              Password must be at least 8 characters
            </Text>

            <DateOfBirthPicker
              value={dateOfBirth}
              onChange={setDateOfBirth}
              error={error?.includes('date of birth') ? error : undefined}
            />

            <TouchableOpacity
              style={styles.signUpButton}
              onPress={handleSignUp}
              disabled={loading}>
              <LinearGradient
                colors={theme.colors.gradients.success}
                style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {loading ? 'Creating Account...' : 'Continue'}
                </Text>
                <ArrowRight color="#FFF" size={20} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => router.push('/welcome/auth/sign-in')}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    minHeight: 800,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.white,
    opacity: 0.8,
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: '#FF3B3080',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.white,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF20',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.white,
  },
  passwordHint: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.white,
    opacity: 0.6,
  },
  signUpButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: theme.typography.families.semibold,
    color: theme.colors.text.white,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.white,
    opacity: 0.8,
  },
  signInText: {
    fontSize: 14,
    fontFamily: theme.typography.families.semibold,
    color: theme.colors.status.success,
  },
});