import { defineConfig, mergeConfig } from 'vitest/config'
import base from '@rpg/config/vitest/base'

// Component/DOM tests (*.test.tsx) run in jsdom with Testing Library setup.
export default mergeConfig(
  base,
  defineConfig({
    test: {
      name: 'ui:jsdom',
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['src/**/*.test.tsx'],
    },
  }),
)
