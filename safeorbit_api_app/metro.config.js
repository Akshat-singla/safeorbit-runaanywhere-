const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add resolver for platform-specific modules
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // Skip react-native-image-viewing on web platform
    if (platform === 'web' && moduleName === 'react-native-image-viewing') {
      return {
        type: 'empty',
      };
    }
    // Otherwise, use the default resolver
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withNativeWind(config, { input: './global.css', inlineRem: 16 });
