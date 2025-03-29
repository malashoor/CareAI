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