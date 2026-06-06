import type { Preview } from "@storybook/react-vite";

import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // Surface a11y findings as failures so CI/Storybook test runs catch them.
      test: "error",
    },
  },
  tags: ["autodocs"],
};

export default preview;
