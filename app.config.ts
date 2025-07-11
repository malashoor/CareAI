import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'CareAI',
  slug: 'care-ai',
  owner: 'cchatllc',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.moayedalashoor.careai',
    buildNumber: '1',
    infoPlist: {
      "NSCameraUsageDescription": "CareAI needs access to your camera to scan medication labels and enable video consultations.",
      "NSMicrophoneUsageDescription": "CareAI needs access to your microphone for voice messages and video consultations.",
      "NSLocationWhenInUseUsageDescription": "CareAI needs your location to provide emergency services and track fall detection events.",
      "ITSAppUsesNonExemptEncryption": false
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.moayedalashoor.careai',
    versionCode: 1,
    permissions: [
      "CAMERA",
      "RECORD_AUDIO",
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "ACTIVITY_RECOGNITION"
    ]
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-router',
    'expo-localization',
    [
      'expo-camera',
      {
        "cameraPermission": "Allow CareAI to access your camera to scan medication labels and enable video consultations."
      }
    ],
    [
      'expo-location',
      {
        "locationAlwaysAndWhenInUsePermission": "CareAI needs your location to provide emergency services and track fall detection events."
      }
    ],
    'expo-notifications',
    [
      'expo-build-properties',
      {
        ios: {
          deploymentTarget: '15.1'
        },
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34
        }
      }
    ]
  ],
  scheme: 'careai',
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true
  },
  extra: {
    privacyPolicyUrl: "https://careai.app/privacy-policy",
    environment: process.env.ENVIRONMENT || "development",
    featureFlags: process.env.FEATURE_FLAGS || "on",
    router: {},
    eas: {
      projectId: "68c2ace0-1ec1-43d3-8542-8ecc2f822d6d"
    }
  }
}); 