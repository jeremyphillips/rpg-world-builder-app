import { defineConfig, mergeConfig } from 'vitest/config'
import base from '@rpg/config/vitest/base'

import { integrationSerialTestFiles } from './src/test/setup/integration-test-files'

export default mergeConfig(
  base,
  defineConfig({
    test: {
      name: 'api:integration-serial',
      environment: 'node',
      include: [...integrationSerialTestFiles],
      globalSetup: ['./src/test/setup/global-setup.ts'],
      setupFiles: ['./src/test/setup/connect-integration-db.ts'],
      fileParallelism: false,
      hookTimeout: 30_000,
      testTimeout: 30_000,
      sequence: { groupOrder: 2 },
    },
  }),
)
