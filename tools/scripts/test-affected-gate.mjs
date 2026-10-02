import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runAffectedTests } from './run-affected-tests.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

runAffectedTests({
  mode: 'gate',
  turboLogPath: resolve(repoRoot, '.tmp/test-affected-gate.turbo.json'),
})
