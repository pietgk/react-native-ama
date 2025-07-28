import AsyncStorage from '@react-native-async-storage/async-storage';
import { view } from '../../.rnstorybook/storybook.requires';

export const ComponentStorybook = view.getStorybookUI({
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
  // Enable WebSocket client to connect to web Storybook server
  enableWebsockets: true,
  host: 'localhost',
  port: 7007,
  secured: false,
});
