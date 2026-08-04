import { defineConfig, mergeConfig } from 'vitest/config'
import base from '@rpg/config/vitest/base'

import { unitTestFiles } from './src/test/setup/unit-test-files'

export default mergeConfig(
  base,
  defineConfig({
    test: {
      name: 'api:unit',
      environment: 'node',
      include: [...unitTestFiles],
      fileParallelism: true,
      sequence: { groupOrder: 0 },
    },
  }),
)
