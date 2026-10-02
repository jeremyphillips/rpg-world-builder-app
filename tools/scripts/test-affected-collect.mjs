import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runAffectedTests } from './run-affected-tests.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

runAffectedTests({
  mode: 'collect',
  inventoryPath: resolve(repoRoot, '.tmp/test-affected-collect.log'),
  turboLogPath: resolve(repoRoot, '.tmp/test-affected-collect.turbo.json'),
  banner: 'test:affected:collect is diagnostic-only. It is not a pre-commit, pre-push, or CI gate.',
})
