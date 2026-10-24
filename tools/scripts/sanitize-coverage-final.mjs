#!/usr/bin/env node
/**
 * Istanbul marks untaken branch paths with -1; fallow's coverage parser expects u32 only.
 * Normalize in place before gate:fallow-health:coverage reads coverage-final.json.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const coveragePath = process.argv[2]
if (!coveragePath) {
  console.error('usage: sanitize-coverage-final.mjs <coverage-final.json>')
  process.exit(2)
}

const data = JSON.parse(readFileSync(coveragePath, 'utf8'))

for (const cov of Object.values(data)) {
  const branchHits = cov.b
  if (!branchHits || typeof branchHits !== 'object') continue

  for (const key of Object.keys(branchHits)) {
    const hits = branchHits[key]
    if (!Array.isArray(hits)) continue
    branchHits[key] = hits.map((value) => (value < 0 ? 0 : value))
  }
}

writeFileSync(coveragePath, JSON.stringify(data))
