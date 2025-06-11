import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { ArrowRight, Eye, EyeOff, Globe, Lock, Mail, Volume2 as VolumeUp } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuditActionTypes, AuditEntityTypes, AuditLogger } from '../../../lib/audit';
import { useLanguage } from '../../hooks/useLanguage';
import { useOfflineStorage } from '../../hooks/useOfflineStorage';
import { supabase } from '../../lib/supabase';

interface SignInError {
  type: 'email' | 'password' | 'network' | 'general';
  message: string;
}

export default function SignInScreen() {
  const router = useRouter();
  const { t, language, changeLanguage, isRTL, availableLanguages } = useLanguage();
  const { isOnline } = useOfflineStorage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SignInError | null>(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Voice feedback for errors and instructions
  useEffect(() => {
    if (error && Platform.OS !== 'web') {
      Speech.speak(error.message, { 
        rate: 0.8, 
        pitch: 1.0,
        language: isRTL ? 'ar' : 'en'
      });
    }
  }, [error, isRTL]);

  const validateForm = (): boolean => {
    if (!email) {
      setError({ type: 'email', message: t('emailRequired') });
      return false;
    }
    if (!email.includes('@')) {
      setError({ type: 'email', message: t('invalidEmail') });
      return false;
    }
    if (!password) {
      setError({ type: 'password', message: t('passwordRequired') });
      return false;
    }
    if (password.length < 8) {
      setError({ type: 'password', message: t('passwordTooShort') });
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    if (!isOnline) {
      setError({ type: 'network', message: t('noInternet') });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      // Get user profile for role-based redirect
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Failed to fetch user profile');
      }

      if (!profile?.role) {
        console.error('No role found for user');
        router.replace('/welcome/role-selection');
        return;
      }

      // Role-based redirect
      switch (profile.role) {
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
          console.error('Invalid role:', profile.role);
          router.replace('/welcome/role-selection');
      }

      // Log sign-in event
      await AuditLogger.log({
        action_type: AuditActionTypes.USER_LOGIN,
        entity_type: AuditEntityTypes.USER,
        entity_id: (await supabase.auth.getUser()).data.user?.id,
        old_value: null,
        new_value: null,
        metadata: { reason: 'User logged in' }
      });

    } catch (err) {
      console.log(err,"err")
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError({ 
        type: 'general',
        message: message.includes('credentials') ? t('invalidCredentials') : t('signInError')
      });
    } finally {
      setLoading(false);
    }
  };

  const speakInstructions = () => {
    if (Platform.OS !== 'web') {
      Speech.speak(t('signInInstructions'), { 
        rate: 0.8, 
        pitch: 1.0,
        language: isRTL ? 'ar' : 'en'
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
    // Announce to screen readers
    if (Platform.OS !== 'web') {
      Speech.speak(showPassword ? t('hidePassword') : t('showPassword'), {
        rate: 0.8,
        pitch: 1.0,
        language: isRTL ? 'ar' : 'en'
      });
    }
  };

  return (
    <View style={[styles.container, isRTL ? styles.rtlContainer : null]}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2000&auto=format&fit=crop' }}
        style={styles.backgroundImage}
        accessibilityIgnoresInvertColors
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}>
        <View style={styles.content}>
          <TouchableOpacity
            style={[styles.languageButton, isRTL && styles.languageButtonRTL]}
            onPress={() => setShowLanguageSelector(!showLanguageSelector)}
            accessibilityRole="button"
            accessibilityLabel={`${t('settings')} - ${language.toUpperCase()}`}
            accessibilityHint="Tap to change language">
            <Globe color="#FFFFFF" size={24} />
            <Text style={styles.languageButtonText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>

          {showLanguageSelector && (
            <View style={[styles.languageSelector, isRTL && styles.languageSelectorRTL]}>
              {availableLanguages.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageOption,
                    language === lang && styles.selectedLanguage
                  ]}
                  onPress={() => {
                    changeLanguage(lang);
                    setShowLanguageSelector(false);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${lang} language`}
                  accessibilityState={{ selected: language === lang }}>
                  <Text style={[
                    styles.languageOptionText,
                    language === lang && styles.selectedLanguageText
                  ]}>
                    {lang.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={[styles.title, isRTL && styles.rtlText]}>{t('welcomeBack')}</Text>
          <Text style={[styles.subtitle, isRTL && styles.rtlText]}>{t('signInToContinue')}</Text>

          <TouchableOpacity
            style={styles.voiceHelpButton}
            onPress={speakInstructions}
            accessibilityRole="button"
            accessibilityLabel={t('listenToInstructions')}
            accessibilityHint="Tap to hear sign in instructions">
            <VolumeUp color="#FFFFFF" size={24} />
            <Text style={styles.voiceHelpText}>{t('listenToInstructions')}</Text>
          </TouchableOpacity>

          {error && (
            <View style={[
              styles.errorContainer,
              error.type === 'network' && styles.networkError
            ]}>
              <Text style={[styles.errorText, isRTL && styles.rtlText]}>{error.message}</Text>
              {error.type === 'network' && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleSignIn}
                  accessibilityRole="button"
                  accessibilityLabel={t('retryConnection')}>
                  <Text style={styles.retryText}>{t('retryConnection')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Mail color="#FFFFFF" size={20} />
              <TextInput
                style={[styles.input, isRTL && styles.rtlInput]}
                placeholder={t('emailPlaceholder')}
                placeholderTextColor="#FFFFFF80"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                writingDirection={isRTL ? 'rtl' : 'ltr'}
                accessibilityLabel={t('emailPlaceholder')}
                accessibilityHint="Enter your email address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock color="#FFFFFF" size={20} />
              <TextInput
                style={[styles.input, isRTL && styles.rtlInput]}
                placeholder={t('passwordPlaceholder')}
                placeholderTextColor="#FFFFFF80"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="password"
                autoComplete="password"
                writingDirection={isRTL ? 'rtl' : 'ltr'}
                accessibilityLabel={t('passwordPlaceholder')}
                accessibilityHint="Enter your password"
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.passwordToggle}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? t('hidePassword') : t('showPassword')}
                accessibilityHint={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? (
                  <EyeOff color="#FFFFFF" size={20} />
                ) : (
                  <Eye color="#FFFFFF" size={20} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.forgotPassword, isRTL && styles.forgotPasswordRTL]}
              onPress={() => router.push('/welcome/auth/forgot-password')}
              accessibilityRole="button"
              accessibilityLabel={t('forgotPassword')}>
              <Text style={[styles.forgotPasswordText, isRTL && styles.rtlText]}>{t('forgotPassword')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signInButton, loading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={loading ? t('signingIn') : t('signIn')}
              accessibilityState={{ disabled: loading }}>
              <LinearGradient
                colors={['#007AFF', '#0055FF']}
                style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {loading ? t('signingIn') : t('signIn')}
                </Text>
                <ArrowRight color="#FFFFFF" size={20} />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={[styles.footer, isRTL && styles.footerRTL]}>
            <Text style={[styles.footerText, isRTL && styles.rtlText]}>{t('noAccount')}</Text>
            <TouchableOpacity
              onPress={() => router.push('/welcome/auth/sign-up')}
              accessibilityRole="button"
              accessibilityLabel={t('signUp')}>
              <Text style={[styles.signUpText, isRTL && styles.rtlText]}>{t('signUp')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  rtlContainer: {
    writingDirection: 'rtl',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    padding: 24,
  },
  languageButton: {
    position: 'absolute',
    top: 40,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  languageButtonRTL: {
    left: 24,
    right: 'auto',
  },
  languageButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontFamily: 'Inter-SemiBold',
  },
  languageSelector: {
    position: 'absolute',
    top: 90,
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 8,
  },
  languageSelectorRTL: {
    left: 24,
    right: 'auto',
  },
  languageOption: {
    padding: 8,
    borderRadius: 8,
  },
  selectedLanguage: {
    backgroundColor: '#007AFF',
  },
  languageOptionText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
  },
  selectedLanguageText: {
    fontFamily: 'Inter-SemiBold',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  rtlText: {
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 32,
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
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    backgroundColor: '#FF3B3080',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  networkError: {
    backgroundColor: '#FF950080',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
  },
  retryButton: {
    backgroundColor: '#FFFFFF20',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
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
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  rtlInput: {
    textAlign: 'right',
  },
  passwordToggle: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordRTL: {
    alignSelf: 'flex-start',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  signInButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 56,
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
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
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
    fontFamily: 'Inter-Regular',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  signUpText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
});