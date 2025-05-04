const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Fix: Add support for SVGs and transpile node_modules/react-native
defaultConfig.transformer = {
  ...defaultConfig.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg');
defaultConfig.resolver.sourceExts.push('svg');

// Enable export mapping and transpilation of react-native
defaultConfig.resolver.unstable_enablePackageExports = true;
defaultConfig.resolver.extraNodeModules = {
  'react-native': require.resolve('react-native'),
};

// Add additional configuration for better compatibility
defaultConfig.watchFolders = [__dirname];
defaultConfig.resolver.nodeModulesPaths = [__dirname];

module.exports = defaultConfig; 