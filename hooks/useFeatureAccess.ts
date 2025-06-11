import { useAuth } from './useAuth';

type Feature = 
  | 'health_monitoring'
  | 'medication_management'
  | 'cognitive_support'
  | 'fall_detection'
  | 'family_monitoring'
  | 'professional_consultation'
  | 'appointment_scheduling'
  | 'social_activities'
  | 'voice_messaging';

const roleFeatureMap: Record<string, Feature[]> = {
  senior: [
    'health_monitoring',
    'medication_management',
    'cognitive_support',
    'fall_detection',
    'social_activities',
    'voice_messaging'
  ],
  child: [
    'family_monitoring',
    'medication_management',
    'fall_detection',
    'voice_messaging',
    'social_activities'
  ],
  medical: [
    'professional_consultation',
    'appointment_scheduling',
    'health_monitoring',
    'medication_management',
    'voice_messaging'
  ]
};

export function useFeatureAccess() {
  const { user } = useAuth();

  const hasAccess = (feature: Feature): boolean => {
    if (!user?.role) return false;
    return roleFeatureMap[user.role].includes(feature);
  };

  return {
    hasAccess,
    allowedFeatures: user?.role ? roleFeatureMap[user.role] : []
  };
}