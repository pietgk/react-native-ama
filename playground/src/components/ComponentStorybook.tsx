import * as React from "react";

export const ComponentStorybook = () => {
  if (process.env.EXPO_PUBLIC_STORYBOOK_ENABLED !== "true") return null;
  const StorybookUIRoot = React.lazy(() => import("../../.rnstorybook"));

  return <StorybookUIRoot />;
};
