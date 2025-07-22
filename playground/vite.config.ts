import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@storybook/react-native-web-vite']
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
});