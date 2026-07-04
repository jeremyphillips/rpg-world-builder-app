import { defineConfig, mergeConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import base from '@rpg/config/vitest/base'

// Component/DOM tests (*.test.tsx) run in jsdom with Testing Library setup.
export default mergeConfig(
  base,
  defineConfig({
    plugins: [react()],
    test: {
      name: 'dashboard:jsdom',
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      include: ['src/**/*.test.tsx'],
    },
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
  }),
)
