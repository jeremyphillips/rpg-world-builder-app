// Diagnostic only. Not a pre-commit, pre-push, or CI gate.
// Same affected graph as test:affected and test:affected:local.
// Continues after package failures and writes a durable inventory.

import { spawn } from 'node:child_process'
import { createWriteStream, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const inventoryPath = resolve(repoRoot, '.tmp/test-affected-collect.log')
const turboLogPath = resolve(repoRoot, '.tmp/test-affected-collect.turbo.json')

mkdirSync(dirname(inventoryPath), { recursive: true })

const banner =
  'test:affected:collect is diagnostic-only. It is not a pre-commit, pre-push, or CI gate.'
process.stderr.write(`${banner}\n`)

const env = { ...process.env }
// Vitest applies this after project caps and fileParallelism: false.
delete env.VITEST_MAX_WORKERS

const child = spawn(
  'pnpm',
  [
    'exec',
    'turbo',
    'run',
    'test',
    '--continue=always',
    '--concurrency=2',
    '--ui=stream',
    '--log-order=grouped',
    '--output-logs=errors-only',
    '--filter=...[HEAD]',
    `--log-file=${turboLogPath}`,
  ],
  {
    cwd: repoRoot,
    env,
    stdio: ['inherit', 'pipe', 'pipe'],
  },
)

const inventory = createWriteStream(inventoryPath)
inventory.write(`${banner}\n`)

function tee(chunk, stream) {
  stream.write(chunk)
  inventory.write(chunk)
}

child.stdout.on('data', (chunk) => {
  tee(chunk, process.stdout)
})
child.stderr.on('data', (chunk) => {
  tee(chunk, process.stderr)
})

child.on('close', (code) => {
  inventory.end(() => {
    process.exit(code ?? 1)
  })
})

child.on('error', (error) => {
  inventory.write(`${error.message}\n`)
  inventory.end(() => {
    process.exit(1)
  })
})
