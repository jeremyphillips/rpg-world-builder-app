import { defineConfig } from 'vitest/config'

// Split into node (pure lib) and jsdom (component) projects so pure .test.ts
// files skip jsdom environment + Testing Library setup entirely. Leaf configs
// are separate files because the repo-root vitest config globs package configs
// as projects and cannot expand nested `test.projects`.
export default defineConfig({
  test: {
    projects: ['./vitest.node.config.ts', './vitest.jsdom.config.ts'],
  },
})
