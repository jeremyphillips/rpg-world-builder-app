import { defineConfig, mergeConfig } from "vitest/config";
import base from "@rpg/config/vitest/base";

export default mergeConfig(
  base,
  defineConfig({
    test: {
      environment: "node",
      // Auth/db integration suites share a single in-memory Mongo; keep them serial.
      fileParallelism: false,
      hookTimeout: 30_000,
      testTimeout: 30_000,
    },
  }),
);
