#!/usr/bin/env node
/**
 * Complexity gate: JSON findings + metric policy (see fallow-health-gate.lib.mjs).
 * Invoked from fallow-health-gate.sh — do not rely on raw `fallow health` human
 * output for pre-commit (estimated CRAP-only findings are advisory there).
 */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { evaluateFallowHealthGate } from './fallow-health-gate.lib.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const hooksDir = dirname(fileURLToPath(import.meta.url))

/** @type {'pre-commit' | 'coverage'} */
let mode = 'pre-commit'
let coveragePath

const args = process.argv.slice(2)
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--coverage') {
    mode = 'coverage'
    coveragePath = args[i + 1]
    if (!coveragePath) {
      console.error('usage: fallow-health-gate.mjs [--coverage <coverage-final.json>]')
      process.exit(2)
    }
    i += 1
    continue
  }
  console.error(`unknown argument: ${args[i]}`)
  process.exit(2)
}

if (mode === 'coverage') {
  const resolved = resolve(repoRoot, coveragePath)
  if (!existsSync(resolved)) {
    console.error(`coverage file missing: ${resolved}`)
    console.error('Run pnpm coverage before gate:fallow-health:coverage.')
    process.exit(2)
  }
  const sanitize = spawnSync(
    process.execPath,
    [resolve(hooksDir, '../scripts/sanitize-coverage-final.mjs'), resolved],
    { cwd: repoRoot, encoding: 'utf8' },
  )
  if (sanitize.status !== 0) {
    console.error(sanitize.stderr || 'sanitize-coverage-final.mjs failed')
    process.exit(sanitize.status === null ? 2 : sanitize.status)
  }
}

/** @type {string[]} */
const fallowArgs = ['health', '--production', '--complexity', '--format', 'json', '--quiet']
if (mode === 'coverage' && coveragePath) {
  fallowArgs.push('--coverage', resolve(repoRoot, coveragePath))
}

const fallow = spawnSync('fallow', fallowArgs, {
  cwd: repoRoot,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
})

if (fallow.error) {
  console.error(fallow.error.message)
  process.exit(2)
}

if (fallow.status === 2) {
  console.error(fallow.stderr || fallow.stdout || 'fallow health failed (exit 2)')
  process.exit(2)
}

let payload
try {
  const raw = (fallow.stdout ?? '').trim()
  if (!raw) {
    console.error('fallow health returned empty JSON stdout')
    process.exit(2)
  }
  payload = JSON.parse(raw)
} catch (error) {
  console.error('failed to parse fallow health JSON:', error)
  if (fallow.stderr) console.error(fallow.stderr)
  process.exit(2)
}

const { ok, summaryLine, gateFailures } = evaluateFallowHealthGate(payload, mode)

const human = spawnSync(
  'fallow',
  [
    'health',
    '--production',
    '--complexity',
    '--format',
    'human',
    ...(mode === 'coverage' && coveragePath ? ['--coverage', resolve(repoRoot, coveragePath)] : []),
  ],
  { cwd: repoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
)

if (human.stdout) process.stdout.write(human.stdout)
if (human.stderr) process.stderr.write(human.stderr)

console.log('')
console.log(summaryLine)

if (!ok) {
  for (const finding of gateFailures) {
    const f = /** @type {{ path?: string; line?: number; name?: string }} */ (finding)
    console.error(`gate failure: ${f.path}:${f.line} ${f.name ?? ''}`)
  }
  process.exit(1)
}

if (fallow.status !== 0 && fallow.status !== null) {
  // Findings present in JSON but filtered for this gate — do not treat as tool failure.
  process.exit(0)
}

process.exit(0)