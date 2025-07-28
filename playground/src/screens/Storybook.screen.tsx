import { View } from "react-native";
import { ComponentStorybook } from "../components/ComponentStorybook";

export const StorybookScreen = () => {
  return (
    <View style={{flex: 1}}>
      <ComponentStorybook />
    </View>
  );
};

// const styles = StyleSheet.create({
//   list: {
//     paddingHorizontal: theme.padding.big,
//   },
//   checkButton: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   checkLabel: {
//     paddingLeft: theme.padding.normal,
//   },
//   testButtons: {
//     paddingTop: theme.padding.normal,
//     flexDirection: 'row',
//   },
//   failingButtonStyle: {
//     backgroundColor: theme.color.black,
//     flex: 1,
//     minHeight: 48,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: theme.padding.normal,
//   },
//   failingText_all: {
//     color: '#525252',
//   },
//   failingText_aa: {
//     color: '#c70000',
//   },
//   failingText_aaa: {
//     color: '#FF0000',
//   },
//   minSizeFailing: {
//     backgroundColor: theme.color.black,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: theme.padding.normal,
//     height: 40,
//     flex: 1,
//   },
// });
