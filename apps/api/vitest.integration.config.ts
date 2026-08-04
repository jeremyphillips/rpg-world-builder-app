import { defineConfig, mergeConfig } from 'vitest/config'
import base from '@rpg/config/vitest/base'

import { integrationSerialTestFiles } from './src/test/setup/integration-test-files'
import { unitTestFiles } from './src/test/setup/unit-test-files'

/** Default worker count after 1/2/4 benchmark (Phase B). Override via CLI --maxWorkers. */
const INTEGRATION_MAX_WORKERS = 2

export default mergeConfig(
  base,
  defineConfig({
    test: {
      name: 'api:integration',
      environment: 'node',
      include: ['src/**/*.test.ts'],
      exclude: [...unitTestFiles, ...integrationSerialTestFiles],
      globalSetup: ['./src/test/setup/global-setup.ts'],
      setupFiles: ['./src/test/setup/connect-integration-db.ts'],
      fileParallelism: true,
      maxWorkers: INTEGRATION_MAX_WORKERS,
      pool: 'forks',
      sequence: { groupOrder: 1 },
      hookTimeout: 30_000,
      testTimeout: 30_000,
    },
  }),
)
