import React from 'react';
import { render } from '@testing-library/react-native';
import WelcomeScreen from '../../project/src/welcome';

// Mock all dependencies
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(obj => obj.ios),
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

jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn() }
  })
}));

jest.mock('../../project/src/hooks/useAuth', () => ({
  useAuth: () => ({
    getCurrentUser: jest.fn(() => Promise.resolve(null)),
  }),
}));

jest.mock('../../project/src/theme', () => ({
  theme: {
    colors: {
      background: {
        primary: '#FFFFFF',
      },
      primary: {
        default: '#000000',
      },
      text: {
        white: '#FFFFFF',
        primary: '#000000',
      },
    },
    typography: {
      families: {
        bold: 'System',
        regular: 'System',
        medium: 'System',
        semibold: 'System',
      },
    },
  },
}));

jest.mock('../../project/src/components/LanguageSelector', () => ({
  LanguageSelector: () => null,
}));

jest.mock('../../project/src/components/Logo', () => ({
  Logo: () => null,
}));

describe('WelcomeScreen', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<WelcomeScreen />);
    expect(getByTestId('welcome-content')).toBeTruthy();
  });
}); 