# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

React Native AMA (Accessible Mobile App) is a comprehensive accessibility-first library for React Native. It provides runtime accessibility checks during development and offers accessible components that replace standard React Native components.

## Commands

### Development
```bash
# Start the playground app
yarn playground
yarn playground:ios
yarn playground:android

# Run Storybook
cd playground && yarn storybook

# Documentation site
yarn doc
```

### Build
```bash
# Build all packages in dependency order
yarn build

# Build individual packages
yarn build:core
yarn build:animations
yarn build:react-native
yarn build:forms
yarn build:lists
yarn build:extras
```

### Code Quality
```bash
# Lint all packages
yarn lint

# Type checking
yarn ts:check

# Format code
yarn prettier

# Run tests in individual packages
cd packages/core && yarn test
```

## Architecture

### Monorepo Structure
- Uses Yarn workspaces
- Packages in `/packages/*` directory
- Each package independently versioned but synchronized using changesets
- Playground app in `/playground` for testing and development

### Key Packages
- **@react-native-ama/core**: Base providers, hooks, and utilities
- **@react-native-ama/react-native**: Accessible replacements for RN components
- **@react-native-ama/animations**: Accessible animation components
- **@react-native-ama/forms**: Accessible form components
- **@react-native-ama/lists**: Accessible list components
- **@react-native-ama/extras**: Additional compound components
- **@react-native-ama/internal**: Internal utilities and checks

### Core Patterns

1. **AMAProvider Pattern**: All apps must wrap their root component in `<AMAProvider>` to enable accessibility checks.

2. **Development vs Production**: Runtime checks only run in development mode. Error boundaries and console warnings help developers fix accessibility issues.

3. **Component Enhancement**: AMA components extend React Native components with accessibility checks and improved defaults.

4. **Hook-based Design**: Custom hooks like `useFocus`, `useTimedAction`, and `useAnimation` provide reusable accessibility logic.

5. **Platform-specific Code**: Separate implementations for iOS/Android when needed (`.ios.ts`, `.android.ts` files).

## Versioning

- Uses changesets for version management
- All packages kept in sync (One True Version)
- Add changesets with: `yarn changeset`
- Version packages with: `yarn version`

## Testing

- Jest with React Native Testing Library
- Test files alongside source files (`.test.ts(x)`)
- Platform-specific tests (`.android.test.ts`, `.ios.test.ts`)
- Run tests per package: `cd packages/[package] && yarn test`

## Key Files

- `tsconfig.json`: TypeScript config with path aliases for all packages
- `babel.base.js`: Shared Babel configuration
- `jest.setup.js`: Test setup for React Native Gesture Handler and Reanimated
- `app.plugin.js`: Expo plugin configuration