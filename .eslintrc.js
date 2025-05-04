module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['react', 'react-native', 'react-hooks', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-native/all',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off', // Not needed in Expo/React Native
    'react-native/no-inline-styles': 'off', // Allow inline styles
    '@typescript-eslint/no-unused-vars': ['warn'],
  },
  settings: {
    react: { version: 'detect' },
  },
}; 