import type { StorybookConfig } from '@storybook/react-native-web-vite';
import path from 'path';

const config: StorybookConfig & { reactNativeServerOptions?: { host: string; port: number } } = {
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    '@storybook/addon-docs'
  ],
  framework: {
    "name": '@storybook/react-native-web-vite',
    "options": {}
  },
  core: {
    disableTelemetry: true,
  },
  reactNativeServerOptions: {
    host: 'localhost',
    port: 7007,
  },

  async viteFinal(config) {
    // Remove vite-tsconfig-paths plugin to prevent it from scanning the entire monorepo
    if (config.plugins) {
      config.plugins = config.plugins.filter(
        (plugin) => !(plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'vite-tsconfig-paths')
      );
    }

    // Add custom plugin to handle ama.rules.json imports
    config.plugins = config.plugins || [];
    config.plugins.push({
      name: 'ama-rules-resolver',
      resolveId(id) {
        if (id === './../../ama.rules.json' || id === './../../../../../ama.rules.json') {
          return path.resolve(__dirname, '../../packages/internal/ama.rules.json');
        }
        return null;
      }
    });

    // Add alias resolution for React Native web and AMA packages
    // This replaces what vite-tsconfig-paths would have done
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': path.resolve(__dirname, '../node_modules/react-native-web'),
      '@react-native-ama/animations': path.resolve(__dirname, '../../packages/animations/src/index'),
      '@react-native-ama/core': path.resolve(__dirname, '../../packages/core/src/index'),
      '@react-native-ama/extras': path.resolve(__dirname, '../../packages/extras/src/index'),
      '@react-native-ama/forms': path.resolve(__dirname, '../../packages/forms/src/index'),
      '@react-native-ama/internal': path.resolve(__dirname, '../../packages/internal/src/index'),
      '@react-native-ama/lists': path.resolve(__dirname, '../../packages/lists/src/index'),
      '@react-native-ama/react-native': path.resolve(__dirname, '../../packages/react-native/src/index'),
    };

    // Add extensions resolution for web
    config.resolve.extensions = [
      '.web.js',
      '.web.ts',
      '.web.tsx',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.json',
      ...(config.resolve.extensions || [])
    ];

    // Configure optimizeDeps to handle react-native-web properly
    config.optimizeDeps = {
      ...config.optimizeDeps,
      include: [
        'react-native-web',
        'expo',
        ...(config.optimizeDeps?.include || [])
      ],
      esbuildOptions: {
        ...config.optimizeDeps?.esbuildOptions,
        loader: {
          '.js': 'jsx',
          ...config.optimizeDeps?.esbuildOptions?.loader
        }
      }
    };

    return config;
  }
};
export default config;