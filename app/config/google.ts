import Constants from 'expo-constants';

export const GOOGLE_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  console.warn('Google API key is not configured. Some features may not work.');
}

export const GOOGLE_CONFIG = {
  apiKey: GOOGLE_API_KEY,
  // Add other Google service configurations here
}; 