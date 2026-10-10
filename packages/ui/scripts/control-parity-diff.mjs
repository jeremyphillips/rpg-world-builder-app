#!/usr/bin/env node
/**
 * Compare two control-parity snapshot directories (Storybook test-runner output).
 *
 * Usage: node scripts/control-parity-diff.mjs [baselineDir] [currentDir]
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const baselineDir = process.argv[2] ?? '.tmp/control-parity/baseline'
const currentDir = process.argv[3] ?? '.tmp/control-parity/current'

function loadJsonDir(dir) {
  const map = new Map()
  try {
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.json')) continue
      map.set(file, JSON.parse(readFileSync(join(dir, file), 'utf8')))
    }
  } catch {
    return map
  }
  return map
}

const baseline = loadJsonDir(baselineDir)
const current = loadJsonDir(currentDir)

const failures = []

for (const [file, snapshot] of current) {
  const prior = baseline.get(file)
  if (!prior) {
    failures.push(`${file}: new snapshot (no baseline)`)
    continue
  }
  if (JSON.stringify(prior) !== JSON.stringify(snapshot)) {
    failures.push(`${file}: computed styles differ from baseline`)
  }
}

for (const file of baseline.keys()) {
  if (!current.has(file)) {
    failures.push(`${file}: missing from current run`)
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`control-parity: ${current.size} snapshots match baseline`)
