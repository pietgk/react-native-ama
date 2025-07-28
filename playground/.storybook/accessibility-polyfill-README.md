# AccessibilityInfo Polyfill for React Native AMA Web Support

A comprehensive polyfill that enables `@react-native-ama/core` to work in web environments (Storybook, React Native Web) by extending the limited `AccessibilityInfo` implementation in `react-native-web`.

> **📋 Quick Overview**: See [accessibility-solution-overview.md](./accessibility-solution-overview.md) for a complete summary of the entire solution.

## Problem Statement

`@react-native-ama/core` is a powerful accessibility library for React Native that provides comprehensive accessibility features and testing capabilities. However, it expects the full React Native `AccessibilityInfo` API, which includes many methods not available in `react-native-web`.

When using AMA with Storybook or other web environments, you'll encounter errors like:
```
TypeError: react_native_1.AccessibilityInfo[contextKey] is not a function
```

This happens because `react-native-web` only implements:
- `isScreenReaderEnabled()`
- `isReduceMotionEnabled()`
- Basic `addEventListener` for `reduceMotionChanged`

But AMA expects additional methods like:
- `isReduceTransparencyEnabled()`
- `isBoldTextEnabled()`
- `isGrayscaleEnabled()`
- And many more...

## Solution

This polyfill provides a runtime monkey-patch that extends both `react-native` and `react-native-web` modules with all the accessibility methods that AMA requires.

### Key Features

✅ **Complete API Coverage**: Implements all `AccessibilityInfo` methods that AMA expects  
✅ **Intelligent Fallbacks**: Uses actual web APIs where possible (e.g., `prefers-reduced-motion`)  
✅ **No-op Safety**: Gracefully handles unsupported methods without breaking functionality  
✅ **Runtime Patching**: Works without requiring complex build configuration  
✅ **Debug Logging**: Provides console output for troubleshooting  
✅ **Type Safety**: Comprehensive JSDoc documentation for all methods  

## Installation & Usage

### 1. Setup in Storybook

Add the polyfill import to your `.storybook/preview.tsx` file **before** importing any components that use AMA:

```typescript
// .storybook/preview.tsx
import React from "react";
// Import the polyfill FIRST, before any AMA components
import "./accessibility-info-polyfill.js";
import { AMAProvider } from "@react-native-ama/core";
// ... other imports

const decorators: Preview["decorators"] = [
  (Story) => (
    <AMAProvider>
      <Story />
    </AMAProvider>
  ),
];
```

### 2. Usage in Other Web Environments

For any web environment using `react-native-web`, import the polyfill before using AMA:

```typescript
// Your web app entry point
import "./path/to/accessibility-info-polyfill.js";
import { AMAProvider } from "@react-native-ama/core";
// ... rest of your app
```

## Implementation Details

### Supported Methods

The polyfill provides these categories of methods:

#### ✅ **Actual Web Implementation**
- `isScreenReaderEnabled()` - Returns `true` (can't reliably detect screen readers)
- `isReduceMotionEnabled()` - Uses `prefers-reduced-motion` CSS media query
- `addEventListener('reduceMotionChanged')` - Real event listener for motion preference changes

#### 🔄 **Polyfilled Methods (Return `false`)**
All iOS/Android-specific accessibility features that don't have web equivalents:
- `isReduceTransparencyEnabled()`
- `isBoldTextEnabled()`
- `isGrayscaleEnabled()`
- `isInvertColorsEnabled()`
- `isHighContrastEnabled()`
- `isDarkerSystemColorsEnabled()`
- `isOnOffSwitchLabelsEnabled()`
- `isClosedCaptionEnabled()`
- `isMonoAudioEnabled()`
- `isShakeToUndoEnabled()`
- `isAssistiveTouchRunning()`
- `isSwitchControlRunning()`
- `isVoiceOverRunning()`
- `isTalkBackRunning()`
- `isAccessibilityServiceEnabled()`

#### 🚫 **No-op Methods**
Methods that exist but have no web equivalent:
- `announceForAccessibility()` - Logs to console
- `announceForAccessibilityWithOptions()` - Logs to console
- `setAccessibilityFocus()` - Logs to console
- `sendAccessibilityEvent()` - Logs to console
- `getRecommendedTimeoutMillis()` - Returns original timeout

### Event Handling

The polyfill handles these accessibility events:

- ✅ **`reduceMotionChanged`**: Real implementation using `matchMedia`
- 🔄 **Mock Events**: `reduceTransparencyChanged`, `boldTextChanged`, `grayscaleChanged`, `invertColorsChanged`, `screenReaderChanged`

All mock events return subscription objects with `remove()` methods for proper cleanup.

### Runtime Patching

The polyfill uses runtime monkey-patching to extend existing modules:

```javascript
// Patches both modules at runtime
Object.assign(reactNative.AccessibilityInfo, ExtendedAccessibilityInfo);
Object.assign(reactNativeWeb.AccessibilityInfo, ExtendedAccessibilityInfo);
```

This ensures that any code importing `AccessibilityInfo` from either module gets the extended version.

## Browser Console Output

When working correctly, you'll see logs like:
```
[AccessibilityInfo] Successfully patched react-native AccessibilityInfo
[AccessibilityInfo] Successfully patched react-native-web AccessibilityInfo
[AccessibilityInfo] addEventListener: reduceTransparencyChanged (no-op)
[AccessibilityInfo] addEventListener: boldTextChanged (no-op)
[AccessibilityInfo] addEventListener: grayscaleChanged (no-op)
[AccessibilityInfo] addEventListener: invertColorsChanged (no-op)
[AccessibilityInfo] addEventListener: screenReaderChanged (no-op)
```

## Testing

### Jest Integration

The polyfill includes comprehensive Jest tests that can be run with:

```bash
yarn test .storybook/accessibility-info-polyfill.test.js
```

**Jest Configuration Note**: If you encounter module resolution errors related to `@react-native-ama/internal/*` modules, ensure your `jest.setup.js` uses virtual mocking:

```javascript
// jest.setup.js
jest.mock("@react-native-ama/internal/dist/utils/logger.js", () => {
  return {
    // Your mock implementation
  };
}, { virtual: true }); // ← This virtual: true flag is crucial
```

The `{ virtual: true }` option tells Jest to create the mock even if the module doesn't exist in the file system, preventing `Cannot find module` errors.

### Test Coverage

The test suite includes 43 tests covering:
- ✅ All accessibility methods (screen reader, reduced motion, etc.)
- ✅ Event listener functionality
- ✅ Error handling and edge cases
- ✅ Browser compatibility scenarios
- ✅ ARIA live region implementation
- ✅ Speech synthesis integration

## Compatibility

### Tested With
- `@react-native-ama/core`: ^1.2.0
- `react-native-web`: Standard distributions
- `Storybook`: v9.0.15+
- `Expo`: Web builds
- `Vite`: As bundler
- `Jest`: v29+ with virtual mocking support

### Browser Support
- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support
- Mobile browsers: Full support

## Limitations & Considerations

### 🚨 **Important Notes**

1. **Mobile-specific features**: Many methods return `false` because corresponding web APIs don't exist
2. **Screen reader detection**: `isScreenReaderEnabled()` always returns `true` as reliable detection isn't possible
3. **Runtime patching**: This is a monkey-patch solution - ideally AMA would have built-in web support
4. **Maintenance**: May need updates when AMA or react-native-web change their APIs

### 🔍 **Future Improvements**

- **Real web accessibility**: Implement actual web accessibility features where possible
- **TypeScript**: Add proper type definitions
- **Testing**: Comprehensive unit tests
- **Performance**: Lazy loading and optimization
- **Configuration**: Allow customization of polyfill behavior

## Troubleshooting

### Common Issues

#### ❌ **Still getting "is not a function" errors**
- Ensure the polyfill is imported **before** any AMA components
- Check console for successful patching messages
- Verify the polyfill file path is correct

#### ❌ **Jest test failures with "Cannot find module" errors**
- Add `{ virtual: true }` to AMA-related mocks in `jest.setup.js`
- This is the clean fix for module resolution conflicts
- See the "Jest Integration" section above for details

#### ❌ **Console warnings about missing types**
- Add `// @ts-ignore` comments if needed
- Consider installing `@types/react-native-web` if available

#### ❌ **Storybook not starting**
- Check for syntax errors in the polyfill file
- Verify the import path in preview.tsx
- Look for circular import issues

### Debug Steps

1. **Check console output**: Look for successful patching messages
2. **Verify import order**: Polyfill must be imported first
3. **Test with simple story**: Create a minimal story to isolate the issue
4. **Check AMA version**: Ensure compatibility with your AMA version

## Additional Documentation

This polyfill is part of a comprehensive solution with multiple documentation files:

- **[Jest Conflict Fix Summary](./jest-conflict-fix-summary.md)** - Details about the Jest virtual mocking fix
- **[GitHub Issue Template](./react-native-ama-issue-template.md)** - Template for contributing upstream to react-native-ama
- **Test File**: `accessibility-info-polyfill.test.js` - Comprehensive test suite

## Contributing

### Reporting Issues
- Provide your environment details (AMA version, Storybook version, Jest version, etc.)
- Include full error messages and stack traces
- Share minimal reproduction steps
- Mention if you're experiencing Jest-related issues

### Improvements
- Test with different AMA versions
- Implement real web accessibility features
- Improve Jest integration and virtual mocking
- Enhance TypeScript support
- Add more comprehensive browser testing

## License

This polyfill is part of the Mindler App project and follows the same license terms.

---

**Need help?** Check the troubleshooting section or create an issue with your specific environment details.