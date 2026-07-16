import { defineConfig } from 'vitest/config'

// Split integration (Mongo + serial) from pure lib tests (parallel, no DB).
// Leaf configs are referenced from the repo-root vitest runner (see vitest.config.ts).
export default defineConfig({
  test: {
    projects: ['./vitest.integration.config.ts', './vitest.unit.config.ts'],
  },
})
