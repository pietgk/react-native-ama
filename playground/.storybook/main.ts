import type { StorybookConfig } from '@storybook/react-native-web-vite';
import path from 'path';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    '@storybook/addon-docs'
  ],
  "framework": {
    "name": '@storybook/react-native-web-vite',
    "options": {}
  },
  async viteFinal(config) {
    // Remove vite-tsconfig-paths plugin to prevent it from scanning the entire monorepo
    if (config.plugins) {
      config.plugins = config.plugins.filter(
        (plugin) => !(plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'vite-tsconfig-paths')
      );
    }

    // Add alias resolution for React Native web and AMA packages
    // This replaces what vite-tsconfig-paths would have done
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': 'react-native-web',
      '@react-native-ama/animations': path.resolve(__dirname, '../../packages/animations/src/index'),
      '@react-native-ama/core': path.resolve(__dirname, '../../packages/core/src/index'),
      '@react-native-ama/extras': path.resolve(__dirname, '../../packages/extras/src/index'),
      '@react-native-ama/forms': path.resolve(__dirname, '../../packages/forms/src/index'),
      '@react-native-ama/internal': path.resolve(__dirname, '../../packages/internal/src/index'),
      '@react-native-ama/lists': path.resolve(__dirname, '../../packages/lists/src/index'),
      '@react-native-ama/react-native': path.resolve(__dirname, '../../packages/react-native/src/index')
    };
    
    return config;
  }
};
export default config;