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
    'react-native/no-inline-styles': 'warn', // Allow inline styles
    '@typescript-eslint/no-unused-vars': ['warn'],
    // disallow literal colors (quick regex)
    'no-restricted-syntax': [
      'warn',
      {
        selector: 'Literal[value=/^#([0-9a-f]{3}){1,2}$/i]',
        message: 'Use palette token, not hard-coded hex.',
      },
    ],
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', '.']],
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
    },
    react: { version: 'detect' },
  },
  env: {
    'react-native/react-native': true,
    'node': true
  }
}; 