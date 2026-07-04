import { defineConfig, mergeConfig } from 'vitest/config'
import base from '@rpg/config/vitest/base'

// Pure lib tests (*.test.ts) run in node — no jsdom/setup cost.
// DOM-dependent tests must use the .test.tsx extension (jsdom project).
export default mergeConfig(
  base,
  defineConfig({
    test: {
      name: 'dashboard:node',
      environment: 'node',
      include: ['src/**/*.test.ts'],
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  }),
)
