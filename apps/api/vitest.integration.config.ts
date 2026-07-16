import { defineConfig, mergeConfig } from 'vitest/config'
import base from '@rpg/config/vitest/base'

import { unitTestFiles } from './src/test/setup/unit-test-files'

export default mergeConfig(
  base,
  defineConfig({
    test: {
      name: 'api:integration',
      environment: 'node',
      include: ['src/**/*.test.ts'],
      exclude: [...unitTestFiles],
      globalSetup: ['./src/test/setup/global-setup.ts'],
      setupFiles: ['./src/test/setup/connect-integration-db.ts'],
      // Shared in-memory Mongo; serial files + beforeEach clear keep isolation.
      fileParallelism: false,
      hookTimeout: 30_000,
      testTimeout: 30_000,
    },
  }),
)
