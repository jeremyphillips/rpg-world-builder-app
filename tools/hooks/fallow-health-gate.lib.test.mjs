import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  evaluateFallowHealthGate,
  exceededIncludesStaticComplexity,
  findingFailsGate,
  formatGateFailureSummary,
} from './fallow-health-gate.lib.mjs'

const fixturesDir = resolve(dirname(fileURLToPath(import.meta.url)), '__fixtures__/fallow-health-gate')

function loadFixture(name) {
  return JSON.parse(readFileSync(resolve(fixturesDir, name), 'utf8'))
}

describe('exceededIncludesStaticComplexity', () => {
  it('treats crap-only as non-gating for pre-commit', () => {
    expect(exceededIncludesStaticComplexity('crap')).toBe(false)
  })

  it('treats cyclomatic, cognitive, and both as gating', () => {
    expect(exceededIncludesStaticComplexity('cyclomatic')).toBe(true)
    expect(exceededIncludesStaticComplexity('cognitive')).toBe(true)
    expect(exceededIncludesStaticComplexity('both')).toBe(true)
  })
})

describe('findingFailsGate', () => {
  const crapOnly = { exceeded: 'crap' }
  const ccOnly = { exceeded: 'cyclomatic' }

  it('ignores crap-only on pre-commit', () => {
    expect(findingFailsGate(crapOnly, 'pre-commit')).toBe(false)
  })

  it('fails cyclomatic on pre-commit', () => {
    expect(findingFailsGate(ccOnly, 'pre-commit')).toBe(true)
  })

  it('fails crap on coverage gate', () => {
    expect(findingFailsGate(crapOnly, 'coverage')).toBe(true)
  })
})

describe('evaluateFallowHealthGate', () => {
  it('passes pre-commit when only estimated CRAP exceeds', () => {
    const payload = loadFixture('crap-only-estimated.json')
    const result = evaluateFallowHealthGate(payload, 'pre-commit')
    expect(result.ok).toBe(true)
    expect(result.gateFailures).toHaveLength(0)
  })

  it('fails pre-commit on cyclomatic violations', () => {
    const payload = loadFixture('cyclomatic-violation.json')
    const result = evaluateFallowHealthGate(payload, 'pre-commit')
    expect(result.ok).toBe(false)
    expect(result.gateFailures).toHaveLength(1)
  })

  it('fails coverage gate on istanbul CRAP', () => {
    const payload = loadFixture('crap-with-coverage.json')
    const result = evaluateFallowHealthGate(payload, 'coverage')
    expect(result.ok).toBe(false)
  })
})

describe('formatGateFailureSummary', () => {
  it('reports success when no failures', () => {
    expect(formatGateFailureSummary([])).toContain('✓')
  })
})