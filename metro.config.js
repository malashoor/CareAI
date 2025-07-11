const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for SVG files
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// Add support for module aliases
config.resolver.alias = {
  '@': __dirname + '/src',
};

// Asset handling configuration
config.resolver.assetExts = [
  ...config.resolver.assetExts.filter(ext => ext !== 'svg'),
  'png', 'jpg', 'jpeg', 'gif', 'webp'
];

config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'svg'
];

// Configure module resolution
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@expo/metro-runtime': path.resolve(__dirname, 'node_modules/@expo/metro-runtime'),
  'expo-router': path.resolve(__dirname, 'node_modules/expo-router'),
  '@expo/vector-icons': path.resolve(__dirname, 'node_modules/@expo/vector-icons'),
};

// Asset registry configuration
config.resolver.assetRegistryPath = path.join(__dirname, 'node_modules/expo-router/assets');

// Performance optimizations
config.maxWorkers = 2;
config.transformer = {
  ...config.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true
    },
    output: {
      ascii_only: true,
      quote_style: 3,
      wrap_iife: true
    },
    sourceMap: {
      includeSources: false
    },
    toplevel: false,
    compress: {
      reduce_funcs: false
    }
  },
  imageLoader: {
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
      esModule: false,
    },
  },
};

// Cache configuration
config.resetCache = true;
config.cacheVersion = "1.0";

// Watchman configuration
config.watchFolders = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, 'assets'),
];

module.exports = config;