module.exports = {
  expo: {
    name: "CareAI",
    slug: "care-ai",
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
      ]
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
    owner: "m_ashoor",
    extra: {
      eas: {
        projectId: "ecad9080-3c6b-430d-9a5a-8f2b9995ee09"
      }
    }
  }
};