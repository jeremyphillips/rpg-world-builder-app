import { spawn } from 'node:child_process'
import { createWriteStream, mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  formatAffectedValidationSummary,
  listFailedTasksFromTurboLog,
  listFailedTasksFromTurboOutput,
  resolveAffectedGateExitCode,
} from './affected-test-gate.lib.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/**
 * @param {{
 *   mode: 'gate' | 'collect'
 *   inventoryPath?: string
 *   turboLogPath?: string
 *   banner?: string
 * }} options
 */
export function runAffectedTests(options) {
  const mode = options.mode
  const inventoryPath = options.inventoryPath ?? resolve(repoRoot, '.tmp/test-affected-collect.log')
  const turboLogPath =
    options.turboLogPath ?? resolve(repoRoot, '.tmp/test-affected-collect.turbo.json')

  const banner =
    options.banner ??
    (mode === 'gate'
      ? 'test:affected:gate runs affected package tests with --continue=always.'
      : 'test:affected:collect is diagnostic-only. It is not a pre-commit, pre-push, or CI gate.')

  if (mode === 'collect') {
    mkdirSync(dirname(inventoryPath), { recursive: true })
  } else {
    mkdirSync(dirname(turboLogPath), { recursive: true })
  }

  process.stderr.write(`${banner}\n`)

  const env = { ...process.env }
  delete env.VITEST_MAX_WORKERS

  const outputChunks = []
  /** @type {import('node:fs').WriteStream | undefined} */
  let inventory

  if (mode === 'collect') {
    inventory = createWriteStream(inventoryPath)
    inventory.write(`${banner}\n`)
  }

  function tee(chunk, stream) {
    stream.write(chunk)
    outputChunks.push(chunk)
    inventory?.write(chunk)
  }

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

  child.stdout.on('data', (chunk) => {
    tee(chunk, process.stdout)
  })
  child.stderr.on('data', (chunk) => {
    tee(chunk, process.stderr)
  })

  child.on('close', (code) => {
    const output = Buffer.concat(outputChunks).toString('utf8')
    let failedTasks = []

    try {
      const logContents = readFileSync(turboLogPath, 'utf8')
      failedTasks = listFailedTasksFromTurboLog(logContents)
    } catch {
      failedTasks = listFailedTasksFromTurboOutput(output)
    }

    if (failedTasks.length === 0) {
      failedTasks = listFailedTasksFromTurboOutput(output)
    }

    const summary = formatAffectedValidationSummary(failedTasks)
    const exitCode = resolveAffectedGateExitCode(code, failedTasks)

    const finish = () => {
      process.stderr.write(`\n${summary}\n`)
      process.exit(exitCode)
    }

    if (inventory) {
      inventory.write(`\n${summary}\n`)
      inventory.end(finish)
      return
    }

    finish()
  })

  child.on('error', (error) => {
    const message = `${error.message}\n`
    if (inventory) {
      inventory.write(message)
      inventory.end(() => {
        process.stderr.write(message)
        process.exit(1)
      })
      return
    }
    process.stderr.write(message)
    process.exit(1)
  })
}
