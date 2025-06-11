import { useState, useCallback } from 'react';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';

type Language = 'en' | 'ar';

const translations = {
  en: {
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
  ar: {
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
  const [language, setLanguage] = useState<Language>('en');

  const changeLanguage = useCallback(async (newLanguage: Language) => {
    const isRTL = newLanguage === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      await Updates.reloadAsync();
    }
    setLanguage(newLanguage);
  }, []);

  const t = useCallback((key: keyof typeof translations.en) => {
    return translations[language][key];
  }, [language]);

  return {
    language,
    changeLanguage,
    t,
    isRTL: language === 'ar',
  };
}