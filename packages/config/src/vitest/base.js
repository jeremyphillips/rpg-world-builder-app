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
  },
}
