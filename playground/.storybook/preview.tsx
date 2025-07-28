// Import AccessibilityInfo polyfill before AMAProvider to ensure compatibility with web
import "./accessibility-info-polyfill.js";
import { AMAProvider } from '@react-native-ama/core';
import type { Preview } from '@storybook/react-native-web-vite'

const parameters: Preview["parameters"] = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

const decorators: Preview["decorators"] = [
  (Story) => {
    return (
      <AMAProvider>
        <Story />
      </AMAProvider>
    );
  },
];

const preview: Preview = {
  parameters,
  decorators,
  tags: ["autodocs"],
};

export default preview;