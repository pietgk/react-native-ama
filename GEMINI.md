# Gemini Project Guidelines

This document provides essential information for developing in this repository with the help of the Gemini AI assistant.

## Project Overview

This is a monorepo for the `react-native-ama` project, a collection of React Native components and utilities focused on accessibility. The project uses Yarn workspaces to manage its multiple packages.

## Key Technologies

- **React Native:** The core framework for building the mobile application.
- **TypeScript:** For static typing and improved code quality.
- **Yarn Workspaces:** To manage the monorepo structure.
- **Jest & React Native Testing Library:** For unit and component testing.
- **ESLint:** For code linting and maintaining style consistency.
- **Prettier:** For automated code formatting.
- **Changesets:** For versioning and managing package releases.
- **Docusaurus:** For the website and documentation.

## Development Workflow

### Initial Setup

1.  **Prerequisites:** Ensure you have `git-lfs` installed.
2.  **Install Dependencies:**
    ```bash
    yarn install
    ```

### Running the Playground

To see your changes in action, you can run the playground application:

-   **Start the playground:**
    ```bash
    yarn playground
    ```
-   **Run on iOS:**
    ```bash
    yarn playground:ios
    ```
-   **Run on Android:**
    ```bash
    yarn playground:android
    ```

### Building Packages

To build all the packages, run the following command:

```bash
yarn build
```

You can also build individual packages using the `build:<package-name>` scripts (e.g., `yarn build:core`).

### Linting and Formatting

-   **Lint:**
    ```bash
    yarn lint
    ```
-   **Format:**
    ```bash
    yarn prettier
    ```

### Type Checking

```bash
yarn ts:check
```

### Testing

Run the test suite with:

```bash
yarn test
```

### Versioning and Releases

This project uses `changesets` to manage versioning. When you make a change that requires a version bump, run:

```bash
yarn changeset
```

Follow the prompts to select the affected packages and the appropriate version bump (major, minor, or patch). This will create a new changeset file that should be committed with your changes.

The release process is automated. When a pull request with a changeset is merged, a "Version Packages" PR is automatically created. Merging this PR will trigger the publishing of the packages to npm.

### Storybook

The `playground` directory is configured to use Storybook for both web and native development.

-   **Web:**
    ```bash
    yarn storybook
    ```
-   **Native:**
    The native Storybook is integrated into the playground app and can be accessed through the "Storybook" screen.

#### Metro Configuration

To ensure that Storybook works correctly in the monorepo, the `playground/metro.config.js` file is configured with the `withStorybook` higher-order function. This handles the necessary polyfills and module resolution for the React Native environment.

It is also configured to be monorepo-aware, watching the entire workspace for changes and resolving modules from both the playground and the root `node_modules` directories.

## Project Structure

-   `packages/`: Contains the individual `react-native-ama` packages.
    -   `animations/`: Animations package.
    -   `core/`: Core functionalities.
    -   `extras/`: Extra components.
    -   `forms/`: Form-related components.
    -   `internal/`: Internal utilities.
    -   `lists/`: List components.
    -   `react-native/`: Main React Native package.
-   `playground/`: A React Native application for testing and developing the packages.
-   `website/`: The Docusaurus-based documentation website.
-   `scripts/`: Contains build and initialization scripts.
