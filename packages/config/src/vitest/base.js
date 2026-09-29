/**
 * Shared Vitest config fragment (plain object, no `vitest` import so this stays
 * dependency-free). Consumers merge it:
 *
 *   import { defineConfig, mergeConfig } from "vitest/config";
 *   import base from "@rpg/config/vitest/base";
 *   export default mergeConfig(base, defineConfig({ test: { environment: "jsdom" } }));
 *
 * @type {import("vitest/config").UserConfig}
 */
export default {
  test: {
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    passWithNoTests: true,
    // Repository policy: finish the file set. Vitest's default is also 0.
    bail: 0,
    // Laptop ceiling for projects that do not set their own maxWorkers.
    // An explicit project cap replaces this. fileParallelism: false still
    // resolves to 1 worker inside Vitest. Do not set VITEST_MAX_WORKERS;
    // Vitest applies that env after those rules and overwrites both.
    maxWorkers: 4,
    coverage: {
      provider: 'v8',
      reporter: ['json', 'text'],
      reportsDirectory: './coverage',
    },
  },
}
