module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/project/src/$1',
    '^app/(.*)$': '<rootDir>/app/$1',
    '^expo-linear-gradient$': '<rootDir>/node_modules/expo-linear-gradient/build/LinearGradient.js'
  },
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '/project/CareAI/',
    '/project/care-ai/'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  haste: {
    defaultPlatform: 'ios',
    platforms: ['android', 'ios', 'native'],
    hasteImplModulePath: null,
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleDirectories: ['node_modules', 'project/src']
}; 