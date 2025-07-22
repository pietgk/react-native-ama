import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Spacer } from '../components/Spacer';
import { Text } from '../components/Text';
import { theme } from '../theme';

export const StorybookScreen = () => {
  return (
    <SafeAreaView style={theme.safeAreaView}>
      <StatusBar style="light" />
      <ScrollView style={styles.list}>
        <Spacer height="big" />
        <Text mt={8} mb={8}>
          This screen displays the accessibility checks AMA can perform on
          pressable elements.
        </Text>
        <Spacer height="big" />

        <Spacer height={'big'} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: theme.padding.big,
  },
  checkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkLabel: {
    paddingLeft: theme.padding.normal,
  },
  testButtons: {
    paddingTop: theme.padding.normal,
    flexDirection: 'row',
  },
  failingButtonStyle: {
    backgroundColor: theme.color.black,
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.padding.normal,
  },
  failingText_all: {
    color: '#525252',
  },
  failingText_aa: {
    color: '#c70000',
  },
  failingText_aaa: {
    color: '#FF0000',
  },
  minSizeFailing: {
    backgroundColor: theme.color.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.padding.normal,
    height: 40,
    flex: 1,
  },
});
