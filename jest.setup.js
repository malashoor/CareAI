import '@testing-library/jest-native/extend-expect';

// Mock React Native modules
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(obj => obj.ios),
  },
  NativeModules: {
    RNCNetInfo: {
      getCurrentState: jest.fn(() => Promise.resolve()),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    StatusBarManager: {
      getHeight: jest.fn(),
      setStyle: jest.fn(),
      setHidden: jest.fn(),
      setNetworkActivityIndicatorVisible: jest.fn(),
    },
  },
  StyleSheet: {
    create: jest.fn(styles => styles),
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  I18nManager: {
    isRTL: false,
  },
}));

// Mock Expo modules
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: jest.fn(() => []),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn(() => Promise.resolve()),
  },
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: jest.fn() },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Mock hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    getCurrentUser: jest.fn(() => Promise.resolve(null)),
  }),
})); 