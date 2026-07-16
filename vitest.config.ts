import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      // dashboard/ui/bench split into node/jsdom leaf projects; their
      // vitest.config.ts files are containers of nested projects, which the
      // root runner can't expand — reference the leaf configs directly.
      'packages/*/vitest.config.ts',
      '!packages/ui/vitest.config.ts',
      'packages/ui/vitest.*.config.ts',
      'apps/*/vitest.config.ts',
      '!apps/api/vitest.config.ts',
      'apps/api/vitest.*.config.ts',
      '!apps/dashboard/vitest.config.ts',
      'apps/dashboard/vitest.*.config.ts',
      '!apps/bench/vitest.config.ts',
      'apps/bench/vitest.*.config.ts',
      'tools/*/vitest.config.ts',
    ],
  },
})
