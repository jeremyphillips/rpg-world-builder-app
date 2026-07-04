import { defineConfig } from 'vitest/config'

// Split into node (pure lib) and jsdom (component) projects so the 80+ pure
// .test.ts files skip jsdom environment + Testing Library setup entirely.
// The project configs live in separate files because the repo-root vitest
// config also globs `apps/*/vitest.config.ts` as projects, and Vitest does
// not run nested `test.projects` from a referenced config file.
export default defineConfig({
  test: {
    projects: ['./vitest.node.config.ts', './vitest.jsdom.config.ts'],
  },
})
