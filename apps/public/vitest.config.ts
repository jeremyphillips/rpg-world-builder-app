import { defineConfig, mergeConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import base from "@rpg/config/vitest/base";

export default mergeConfig(
  base,
  defineConfig({
    plugins: [react()],
    test: {
      environment: "jsdom",
      setupFiles: ["./vitest.setup.ts"],
      // Only run our unit/RTL tests, never Next build artifacts.
      include: ["src/**/*.test.{ts,tsx}"],
    },
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
      },
    },
  }),
);
