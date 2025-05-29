import { useState, useCallback } from 'react';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'es' | 'zh' | 'hi' | 'ar';

const translations = {
  en: {
    // English translations
    home: 'Home',
    chat: 'Chat',
    health: 'Health',
    voice: 'Voice',
    settings: 'Settings',
    greeting: 'Good morning',
    todaySchedule: "Today's Schedule",
    medications: 'Medications',
    wellnessFacts: 'Wellness Facts',
    shareStory: 'Share Story',
    quickActions: 'Quick Actions',
    healthMonitoring: 'Health Monitoring',
    heartRate: 'Heart Rate',
    steps: 'Steps',
    water: 'Water',
    voiceAssistant: 'Voice Assistant',
    tapToSpeak: 'Tap to Speak',
    listening: 'Listening...',
    profile: 'Profile',
    preferences: 'Preferences',
    security: 'Security',
    logout: 'Log Out',
    
    // Authentication translations
    welcomeBack: 'Welcome Back',
    signInToContinue: 'Sign in to continue to CareAI',
    listenToInstructions: 'Listen to Instructions',
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot Password?',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signingIn: 'Signing In...',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    
    // Validation messages
    emailRequired: 'Email is required',
    invalidEmail: 'Please enter a valid email',
    passwordRequired: 'Password is required',
    passwordTooShort: 'Password must be at least 8 characters',
    invalidCredentials: 'Invalid email or password',
    signInError: 'Sign in failed. Please try again.',
    noInternet: 'No internet connection',
    retryConnection: 'Retry Connection',
    
    // Voice instructions
    signInInstructions: 'Enter your email and password to sign in to CareAI. You can tap the sound button for voice instructions.',
    
    // Show/Hide password
    showPassword: 'Show Password',
    hidePassword: 'Hide Password',
  },
  es: {
    // Spanish translations
    home: 'Inicio',
    chat: 'Chat',
    health: 'Salud',
    voice: 'Voz',
    settings: 'Configuración',
    greeting: 'Buenos días',
    todaySchedule: 'Horario de Hoy',
    medications: 'Medicamentos',
    wellnessFacts: 'Datos de Bienestar',
    shareStory: 'Compartir Historia',
    quickActions: 'Acciones Rápidas',
    healthMonitoring: 'Monitoreo de Salud',
    heartRate: 'Ritmo Cardíaco',
    steps: 'Pasos',
    water: 'Agua',
    voiceAssistant: 'Asistente de Voz',
    tapToSpeak: 'Toca para Hablar',
    listening: 'Escuchando...',
    profile: 'Perfil',
    preferences: 'Preferencias',
    security: 'Seguridad',
    logout: 'Cerrar Sesión',
    
    // Authentication translations
    welcomeBack: 'Bienvenido de Vuelta',
    signInToContinue: 'Inicia sesión para continuar a CareAI',
    listenToInstructions: 'Escuchar Instrucciones',
    emailPlaceholder: 'Ingresa tu correo electrónico',
    passwordPlaceholder: 'Ingresa tu contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    signingIn: 'Iniciando Sesión...',
    noAccount: '¿No tienes una cuenta?',
    hasAccount: '¿Ya tienes una cuenta?',
    
    // Validation messages
    emailRequired: 'El correo electrónico es requerido',
    invalidEmail: 'Por favor ingresa un correo electrónico válido',
    passwordRequired: 'La contraseña es requerida',
    passwordTooShort: 'La contraseña debe tener al menos 8 caracteres',
    invalidCredentials: 'Correo electrónico o contraseña inválidos',
    signInError: 'Error al iniciar sesión. Por favor intenta de nuevo.',
    noInternet: 'Sin conexión a internet',
    retryConnection: 'Reintentar Conexión',
    
    // Voice instructions
    signInInstructions: 'Ingresa tu correo electrónico y contraseña para iniciar sesión en CareAI. Puedes tocar el botón de sonido para instrucciones de voz.',
    
    // Show/Hide password
    showPassword: 'Mostrar Contraseña',
    hidePassword: 'Ocultar Contraseña',
  },
  zh: {
    // Chinese translations
    home: '首页',
    chat: '聊天',
    health: '健康',
    voice: '语音',
    settings: '设置',
    greeting: '早上好',
    todaySchedule: '今日日程',
    medications: '药物',
    wellnessFacts: '健康知识',
    shareStory: '分享故事',
    quickActions: '快速操作',
    healthMonitoring: '健康监测',
    heartRate: '心率',
    steps: '步数',
    water: '饮水',
    voiceAssistant: '语音助手',
    tapToSpeak: '点击说话',
    listening: '正在听...',
    profile: '个人资料',
    preferences: '偏好设置',
    security: '安全',
    logout: '退出登录',
    
    // Authentication translations
    welcomeBack: '欢迎回来',
    signInToContinue: '登录以继续使用 CareAI',
    listenToInstructions: '收听说明',
    emailPlaceholder: '输入您的邮箱',
    passwordPlaceholder: '输入您的密码',
    forgotPassword: '忘记密码？',
    signIn: '登录',
    signUp: '注册',
    signingIn: '正在登录...',
    noAccount: '没有账户？',
    hasAccount: '已有账户？',
    
    // Validation messages
    emailRequired: '邮箱是必需的',
    invalidEmail: '请输入有效的邮箱',
    passwordRequired: '密码是必需的',
    passwordTooShort: '密码必须至少8个字符',
    invalidCredentials: '邮箱或密码无效',
    signInError: '登录失败，请重试。',
    noInternet: '无网络连接',
    retryConnection: '重试连接',
    
    // Voice instructions
    signInInstructions: '输入您的邮箱和密码以登录CareAI。您可以点击声音按钮获取语音说明。',
    
    // Show/Hide password
    showPassword: '显示密码',
    hidePassword: '隐藏密码',
  },
  hi: {
    // Hindi translations
    home: 'होम',
    chat: 'चैट',
    health: 'स्वास्थ्य',
    voice: 'आवाज़',
    settings: 'सेटिंग्स',
    greeting: 'सुप्रभात',
    todaySchedule: 'आज का कार्यक्रम',
    medications: 'दवाएं',
    wellnessFacts: 'स्वास्थ्य तथ्य',
    shareStory: 'कहानी साझा करें',
    quickActions: 'त्वरित कार्य',
    healthMonitoring: 'स्वास्थ्य निगरानी',
    heartRate: 'हृदय गति',
    steps: 'कदम',
    water: 'पानी',
    voiceAssistant: 'वॉइस असिस्टेंट',
    tapToSpeak: 'बोलने के लिए टैप करें',
    listening: 'सुन रहा है...',
    profile: 'प्रोफ़ाइल',
    preferences: 'प्राथमिकताएं',
    security: 'सुरक्षा',
    logout: 'लॉग आउट',
    
    // Authentication translations
    welcomeBack: 'वापस स्वागत है',
    signInToContinue: 'CareAI में जारी रखने के लिए साइन इन करें',
    listenToInstructions: 'निर्देश सुनें',
    emailPlaceholder: 'अपना ईमेल दर्ज करें',
    passwordPlaceholder: 'अपना पासवर्ड दर्ज करें',
    forgotPassword: 'पासवर्ड भूल गए?',
    signIn: 'साइन इन',
    signUp: 'साइन अप',
    signingIn: 'साइन इन हो रहा है...',
    noAccount: 'खाता नहीं है?',
    hasAccount: 'पहले से खाता है?',
    
    // Validation messages
    emailRequired: 'ईमेल आवश्यक है',
    invalidEmail: 'कृपया एक वैध ईमेल दर्ज करें',
    passwordRequired: 'पासवर्ड आवश्यक है',
    passwordTooShort: 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए',
    invalidCredentials: 'अमान्य ईमेल या पासवर्ड',
    signInError: 'साइन इन विफल। कृपया पुनः प्रयास करें।',
    noInternet: 'इंटरनेट कनेक्शन नहीं',
    retryConnection: 'कनेक्शन पुनः प्रयास करें',
    
    // Voice instructions
    signInInstructions: 'CareAI में साइन इन करने के लिए अपना ईमेल और पासवर्ड दर्ज करें। आप वॉयस निर्देशों के लिए साउंड बटन टैप कर सकते हैं।',
    
    // Show/Hide password
    showPassword: 'पासवर्ड दिखाएं',
    hidePassword: 'पासवर्ड छुपाएं',
  },
  ar: {
    // Arabic translations
    home: 'الرئيسية',
    chat: 'الدردشة',
    health: 'الصحة',
    voice: 'الصوت',
    settings: 'الإعدادات',
    greeting: 'صباح الخير',
    todaySchedule: 'جدول اليوم',
    medications: 'الأدوية',
    wellnessFacts: 'حقائق صحية',
    shareStory: 'شارك قصة',
    quickActions: 'إجراءات سريعة',
    healthMonitoring: 'مراقبة الصحة',
    heartRate: 'معدل ضربات القلب',
    steps: 'الخطوات',
    water: 'الماء',
    voiceAssistant: 'المساعد الصوتي',
    tapToSpeak: 'انقر للتحدث',
    listening: 'جاري الاستماع...',
    profile: 'الملف الشخصي',
    preferences: 'التفضيلات',
    security: 'الأمان',
    logout: 'تسجيل الخروج',
    
    // Authentication translations
    welcomeBack: 'مرحباً بعودتك',
    signInToContinue: 'سجل الدخول للمتابعة إلى CareAI',
    listenToInstructions: 'الاستماع للتعليمات',
    emailPlaceholder: 'أدخل بريدك الإلكتروني',
    passwordPlaceholder: 'أدخل كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    signingIn: 'جاري تسجيل الدخول...',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',
    
    // Validation messages
    emailRequired: 'البريد الإلكتروني مطلوب',
    invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح',
    passwordRequired: 'كلمة المرور مطلوبة',
    passwordTooShort: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل',
    invalidCredentials: 'بريد إلكتروني أو كلمة مرور غير صحيحة',
    signInError: 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.',
    noInternet: 'لا يوجد اتصال بالإنترنت',
    retryConnection: 'إعادة المحاولة',
    
    // Voice instructions
    signInInstructions: 'أدخل بريدك الإلكتروني وكلمة المرور لتسجيل الدخول إلى CareAI. يمكنك النقر على زر الصوت للحصول على تعليمات صوتية.',
    
    // Show/Hide password
    showPassword: 'إظهار كلمة المرور',
    hidePassword: 'إخفاء كلمة المرور',
  },
};

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    // Get device locale
    const locale = Localization.locale.split('-')[0] as Language;
    return Object.keys(translations).includes(locale) ? locale : 'en';
  });

  const loadSavedLanguage = useCallback(async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('userLanguage');
      if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
        setLanguage(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  }, []);

  const changeLanguage = useCallback(async (newLanguage: Language) => {
    try {
      const isRTL = newLanguage === 'ar';
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        await Updates.reloadAsync();
      }
      await AsyncStorage.setItem('userLanguage', newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }, []);

  const t = useCallback((key: keyof typeof translations.en) => {
    return translations[language][key] || translations.en[key];
  }, [language]);

  return {
    language,
    changeLanguage,
    t,
    isRTL: language === 'ar',
    availableLanguages: Object.keys(translations) as Language[],
    loadSavedLanguage,
  };
}