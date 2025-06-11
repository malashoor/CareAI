import 'dotenv/config';

module.exports = {
  expo: {
    name: "CareAI",
    slug: "CareAI",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.careai.app",
      buildNumber: "1",
      infoPlist: {
        "NSCameraUsageDescription": "CareAI needs access to your camera to scan medication labels and enable video consultations.",
        "NSMicrophoneUsageDescription": "CareAI needs access to your microphone for voice messages and video consultations.",
        "NSLocationWhenInUseUsageDescription": "CareAI needs your location to provide emergency services and track fall detection events."
      },
      runtimeVersion: {
        policy: "appVersion", // Use app version for runtime version
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.careai.app",
      versionCode: 1,
      permissions: [
        "CAMERA",
        "RECORD_AUDIO",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACTIVITY_RECOGNITION"
      ],
      runtimeVersion: "1.0.0", // Use your app version here
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-localization",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow CareAI to access your camera to scan medication labels and enable video consultations."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "CareAI needs your location to provide emergency services and track fall detection events."
        }
      ],
      "expo-notifications"
    ],
    scheme: "careai",
    owner: "cchatllc",
    extra: {
      eas: {
        projectId: "928d6784-3b20-4600-8e70-02c4ab3516e6"
      },
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      EXPO_PUBLIC_OPENAI_MODEL: process.env.EXPO_PUBLIC_OPENAI_MODEL,
      EXPO_PUBLIC_OPENAI_MAX_TOKENS: process.env.EXPO_PUBLIC_OPENAI_MAX_TOKENS,
      EXPO_PUBLIC_OPENAI_TEMPERATURE: process.env.EXPO_PUBLIC_OPENAI_TEMPERATURE,
      EXPO_ACCESS_TOKEN: process.env.EXPO_ACCESS_TOKEN,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
      EXPO_PUBLIC_GOOGLE_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_API_KEY
    },
    updates: {
      url: "https://u.expo.dev/928d6784-3b20-4600-8e70-02c4ab3516e6",  // Replace with your actual URL if different
    }
  }
};

