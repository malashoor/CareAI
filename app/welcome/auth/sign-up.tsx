import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Volume2, Shield, CheckCircle, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { theme } from '@/theme';
import { useLanguage } from '@/hooks/useLanguage';
import DateOfBirthPicker from '../../components/DateOfBirthPicker';
import { isValidDOB } from '@/lib/utils/age';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}

interface ValidationError {
  field: string;
  message: string;
}

export default function SignUpScreen() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Weak',
    color: '#FF3B30',
    suggestions: []
  });
  
  // Multi-step flow state
  const [currentStep, setCurrentStep] = useState(1);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Password strength calculation
  useEffect(() => {
    if (password) {
      const strength = calculatePasswordStrength(password);
      setPasswordStrength(strength);
    }
  }, [password]);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const suggestions: string[] = [];
    
    // Length check
    if (password.length >= 8) score += 25;
    else suggestions.push('Use at least 8 characters');
    
    // Uppercase letter
    if (/[A-Z]/.test(password)) score += 25;
    else suggestions.push('Include uppercase letters');
    
    // Lowercase letter
    if (/[a-z]/.test(password)) score += 25;
    else suggestions.push('Include lowercase letters');
    
    // Numbers
    if (/\d/.test(password)) score += 15;
    else suggestions.push('Include numbers');
    
    // Special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;
    else suggestions.push('Include special characters');
    
    let label, color;
    if (score < 25) {
      label = 'Very Weak';
      color = '#FF3B30';
    } else if (score < 50) {
      label = 'Weak';
      color = '#FF9500';
    } else if (score < 75) {
      label = 'Good';
      color = '#FFCC00';
    } else {
      label = 'Strong';
      color = '#34C759';
    }
    
    return { score, label, color, suggestions };
  };

  const validateForm = (): ValidationError[] => {
    const newErrors: ValidationError[] = [];

    // Name validation
    if (!name.trim()) {
      newErrors.push({ field: 'name', message: 'Full name is required' });
    } else if (name.trim().length < 2) {
      newErrors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    }

    // Email validation
    if (!email.trim()) {
      newErrors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.push({ field: 'email', message: 'Please enter a valid email address' });
    }

    // Password validation
    if (!password) {
      newErrors.push({ field: 'password', message: 'Password is required' });
    } else {
      if (password.length < 8) {
        newErrors.push({ field: 'password', message: 'Password must be at least 8 characters' });
      }
      if (passwordStrength.score < 50) {
        newErrors.push({ field: 'password', message: 'Password is too weak. Please choose a stronger password.' });
      }
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
    } else if (password !== confirmPassword) {
      newErrors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }

    // Date of birth validation
    if (!dateOfBirth) {
      newErrors.push({ field: 'dateOfBirth', message: 'Date of birth is required' });
    } else if (!isValidDOB(dateOfBirth.toISOString())) {
      newErrors.push({ field: 'dateOfBirth', message: 'You must be at least 40 years old to use CareAI' });
    }

    return newErrors;
  };

  const speakText = async (text: string) => {
    if (Platform.OS !== 'web') {
      try {
        await Speech.speak(text, {
          rate: 0.8,
          pitch: 1.0,
          language: isRTL ? 'ar' : 'en'
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.error('Error speaking text:', error);
      }
    }
  };

  const handleCreateAccount = async () => {
    try {
      setLoading(true);
      const validationErrors = validateForm();
      
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        await speakText(`Please fix the following errors: ${validationErrors.map(e => e.message).join('. ')}`);
        return;
      }

      setErrors([]);

      // Create user account with email verification
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
            email: email.trim().toLowerCase()
          },
          emailRedirectTo: `${window.location.origin}/welcome/auth/verify-email`
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Failed to create account');

      // Create initial profile (will be activated after email verification)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          date_of_birth: dateOfBirth?.toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: isRTL ? 'ar' : 'en',
          email_verified: false,
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

      setEmailVerificationSent(true);
      setCurrentStep(2);
      await speakText('Account created successfully! Please check your email to verify your account.');
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setErrors([{ field: 'general', message }]);
      await speakText(`Error: ${message}`);
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsVerifying(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/welcome/auth/verify-email`
        }
      });

      if (error) throw error;
      
      await speakText('Verification email resent successfully');
      Alert.alert('Success', 'Verification email has been resent');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend verification email';
      await speakText(`Error: ${message}`);
      Alert.alert('Error', message);
    } finally {
      setIsVerifying(false);
    }
  };

  const getErrorForField = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  const renderPasswordStrengthIndicator = () => (
    <View style={styles.passwordStrengthContainer}>
      <View style={styles.passwordStrengthBar}>
        <View 
          style={[
            styles.passwordStrengthFill,
            { width: `${passwordStrength.score}%`, backgroundColor: passwordStrength.color }
          ]} 
        />
      </View>
      <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
        {passwordStrength.label}
      </Text>
      {passwordStrength.suggestions.length > 0 && (
        <View style={styles.passwordSuggestions}>
          {passwordStrength.suggestions.slice(0, 2).map((suggestion, index) => (
            <Text key={index} style={styles.passwordSuggestionText}>
              • {suggestion}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.form}>
      <View style={[styles.inputContainer, getErrorForField('name') && styles.inputError]}>
        <User color="#FFFFFF" size={20} />
        <TextInput
          style={[styles.input, isRTL && styles.rtlInput]}
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          placeholderTextColor="#FFFFFF80"
          autoCapitalize="words"
          autoCorrect={false}
          writingDirection={isRTL ? 'rtl' : 'ltr'}
          accessibilityLabel="Full name input"
          accessibilityHint="Enter your full name"
        />
      </View>
      {getErrorForField('name') && (
        <Text style={styles.errorText}>{getErrorForField('name')}</Text>
      )}

      <View style={[styles.inputContainer, getErrorForField('email') && styles.inputError]}>
        <Mail color="#FFFFFF" size={20} />
        <TextInput
          style={[styles.input, isRTL && styles.rtlInput]}
          value={email}
          onChangeText={setEmail}
          placeholder="Email Address"
          placeholderTextColor="#FFFFFF80"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          writingDirection={isRTL ? 'rtl' : 'ltr'}
          accessibilityLabel="Email address input"
          accessibilityHint="Enter your email address"
        />
      </View>
      {getErrorForField('email') && (
        <Text style={styles.errorText}>{getErrorForField('email')}</Text>
      )}

      <View style={[styles.inputContainer, getErrorForField('password') && styles.inputError]}>
        <Lock color="#FFFFFF" size={20} />
        <TextInput
          style={[styles.input, isRTL && styles.rtlInput]}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#FFFFFF80"
          secureTextEntry={!showPassword}
          textContentType="newPassword"
          writingDirection={isRTL ? 'rtl' : 'ltr'}
          accessibilityLabel="Password input"
          accessibilityHint="Enter your password"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.passwordToggle}
          accessibilityRole="button"
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
          {showPassword ? (
            <EyeOff color="#FFFFFF" size={20} />
          ) : (
            <Eye color="#FFFFFF" size={20} />
          )}
        </TouchableOpacity>
      </View>
      
      {password && renderPasswordStrengthIndicator()}
      {getErrorForField('password') && (
        <Text style={styles.errorText}>{getErrorForField('password')}</Text>
      )}

      <View style={[styles.inputContainer, getErrorForField('confirmPassword') && styles.inputError]}>
        <Lock color="#FFFFFF" size={20} />
        <TextInput
          style={[styles.input, isRTL && styles.rtlInput]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
          placeholderTextColor="#FFFFFF80"
          secureTextEntry={!showConfirmPassword}
          textContentType="newPassword"
          writingDirection={isRTL ? 'rtl' : 'ltr'}
          accessibilityLabel="Confirm password input"
          accessibilityHint="Re-enter your password to confirm"
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={styles.passwordToggle}
          accessibilityRole="button"
          accessibilityLabel={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}>
          {showConfirmPassword ? (
            <EyeOff color="#FFFFFF" size={20} />
          ) : (
            <Eye color="#FFFFFF" size={20} />
          )}
        </TouchableOpacity>
      </View>
      {getErrorForField('confirmPassword') && (
        <Text style={styles.errorText}>{getErrorForField('confirmPassword')}</Text>
      )}

      <DateOfBirthPicker
        value={dateOfBirth}
        onChange={setDateOfBirth}
        error={getErrorForField('dateOfBirth')}
      />

      <TouchableOpacity
        style={[styles.signUpButton, loading && styles.buttonDisabled]}
        onPress={handleCreateAccount}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={loading ? 'Creating account' : 'Create account'}
        accessibilityState={{ disabled: loading }}>
        <LinearGradient
          colors={theme.colors.gradients.success}
          style={styles.buttonGradient}>
          <Text style={styles.buttonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
          <ArrowRight color="#FFF" size={20} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.verificationContainer}>
      <View style={styles.verificationIconContainer}>
        <Mail color="#007AFF" size={48} />
      </View>
      <Text style={styles.verificationTitle}>Check Your Email</Text>
      <Text style={styles.verificationText}>
        We've sent a verification link to {email}. Please check your email and click the link to verify your account.
      </Text>
      
      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResendVerification}
        disabled={isVerifying}
        accessibilityRole="button"
        accessibilityLabel="Resend verification email">
        <Text style={styles.resendButtonText}>
          {isVerifying ? 'Sending...' : 'Resend Verification Email'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backToSignInButton}
        onPress={() => router.push('/welcome/auth/sign-in')}
        accessibilityRole="button"
        accessibilityLabel="Go back to sign in">
        <Text style={styles.backToSignInText}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={[styles.container, isRTL && styles.rtlContainer]}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=2000&auto=format&fit=crop' }}
        style={styles.backgroundImage}
        accessibilityIgnoresInvertColors
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}>
        <View style={styles.content}>
          {/* Voice Help Button */}
          <TouchableOpacity
            style={styles.voiceHelpButton}
            onPress={() => speakText(currentStep === 1 ? 'Fill out the form to create your CareAI account. All fields are required.' : 'Check your email for a verification link to complete your account setup.')}
            accessibilityRole="button"
            accessibilityLabel="Tap to hear instructions">
            <Volume2 color="#FFFFFF" size={24} />
            <Text style={styles.voiceHelpText}>Listen to Instructions</Text>
          </TouchableOpacity>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]} />
          </View>

          <Text style={[styles.title, isRTL && styles.rtlText]}>
            {currentStep === 1 ? 'Create Account' : 'Verify Email'}
          </Text>
          <Text style={[styles.subtitle, isRTL && styles.rtlText]}>
            {currentStep === 1 ? 'Join CareAI to start your care journey' : 'Almost there! Just verify your email'}
          </Text>

          {errors.find(e => e.field === 'general') && (
            <View style={styles.errorContainer}>
              <AlertCircle color="#FFFFFF" size={20} />
              <Text style={styles.errorText}>{errors.find(e => e.field === 'general')?.message}</Text>
            </View>
          )}

          {currentStep === 1 ? renderStep1() : renderStep2()}

          {currentStep === 1 && (
            <View style={[styles.footer, isRTL && styles.footerRTL]}>
              <Text style={[styles.footerText, isRTL && styles.rtlText]}>Already have an account?</Text>
              <TouchableOpacity
                onPress={() => router.push('/welcome/auth/sign-in')}
                accessibilityRole="button"
                accessibilityLabel="Go to sign in">
                <Text style={[styles.signInText, isRTL && styles.rtlText]}>Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
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
  rtlContainer: {
    direction: 'rtl',
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
  voiceHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  voiceHelpText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontFamily: theme.typography.families.regular,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF20',
  },
  stepDotActive: {
    backgroundColor: theme.colors.status.success,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#FFFFFF20',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: theme.colors.status.success,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.white,
    marginBottom: 8,
  },
  rtlText: {
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.white,
    opacity: 0.8,
    marginBottom: 32,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B3080',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
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
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.white,
  },
  rtlInput: {
    textAlign: 'right',
  },
  passwordToggle: {
    padding: 8,
    borderRadius: 8,
  },
  passwordStrengthContainer: {
    marginTop: 8,
  },
  passwordStrengthBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#FFFFFF20',
    borderRadius: 3,
    overflow: 'hidden',
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontFamily: theme.typography.families.semibold,
    marginTop: 4,
  },
  passwordSuggestions: {
    marginTop: 8,
  },
  passwordSuggestionText: {
    fontSize: 11,
    fontFamily: theme.typography.families.regular,
    color: '#FFFFFF80',
    marginBottom: 2,
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
  buttonDisabled: {
    opacity: 0.6,
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
  footerRTL: {
    flexDirection: 'row-reverse',
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
  verificationContainer: {
    alignItems: 'center',
    padding: 24,
  },
  verificationIconContainer: {
    backgroundColor: '#FFFFFF20',
    borderRadius: 40,
    padding: 24,
    marginBottom: 24,
  },
  verificationTitle: {
    fontSize: 24,
    fontFamily: theme.typography.families.bold,
    color: theme.colors.text.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  verificationText: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.white,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 32,
    lineHeight: 24,
  },
  resendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  resendButtonText: {
    fontSize: 16,
    fontFamily: theme.typography.families.semibold,
    color: theme.colors.text.white,
  },
  backToSignInButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF40',
  },
  backToSignInText: {
    fontSize: 16,
    fontFamily: theme.typography.families.regular,
    color: theme.colors.text.white,
  },
});