import { describe, expect, it } from 'vitest'

import {
  formatClosedSetDescription,
  formatEnumDescription,
  formatUnionBranchDescription,
  keysFromEntries,
  termOptionsFromEntries,
  vocabEnumFromEntries,
} from './enum-schema'
import type { GameTermEntry } from './types'

const SAMPLE_ENTRIES = {
  alpha: {
    label: 'Alpha',
    description: 'First value.',
  },
  beta: {
    label: 'Beta',
    description: 'Second value.',
  },
} as const satisfies Record<string, GameTermEntry>

describe('formatEnumDescription', () => {
  it('lists enum keys only by default', () => {
    expect(formatEnumDescription(SAMPLE_ENTRIES)).toBe('- **alpha**\n- **beta**')
  })

  it('includes per-value prose when showDescription is true', () => {
    expect(formatEnumDescription(SAMPLE_ENTRIES, { showDescription: true })).toBe(
      '- **alpha**: First value.\n- **beta**: Second value.',
    )
  })
})

describe('formatClosedSetDescription', () => {
  it('formats structural closed sets without entries', () => {
    expect(formatClosedSetDescription(['fixed', 'choice'])).toBe('- **fixed**\n- **choice**')
  })
})

describe('formatUnionBranchDescription', () => {
  it('lists union branches on the discriminant', () => {
    expect(formatUnionBranchDescription('kind', ['fixed', 'choice'])).toBe(
      'Branch on **kind**: **fixed** | **choice**',
    )
  })
})

describe('vocabEnumFromEntries', () => {
  const schema = vocabEnumFromEntries(SAMPLE_ENTRIES)

  it('accepts every entry key', () => {
    expect(schema.parse('alpha')).toBe('alpha')
    expect(schema.parse('beta')).toBe('beta')
  })

  it('rejects unknown values', () => {
    expect(schema.safeParse('gamma').success).toBe(false)
  })

  it('attaches a composite description', () => {
    expect(schema.description).toBe(formatEnumDescription(SAMPLE_ENTRIES))
  })
})

describe('keysFromEntries', () => {
  it('returns entry keys as a non-empty tuple', () => {
    expect(keysFromEntries(SAMPLE_ENTRIES)).toEqual(['alpha', 'beta'])
  })
})

describe('termOptionsFromEntries', () => {
  it('returns value, label, and description for each entry', () => {
    expect(termOptionsFromEntries(SAMPLE_ENTRIES)).toEqual([
      { value: 'alpha', label: 'Alpha', description: 'First value.' },
      { value: 'beta', label: 'Beta', description: 'Second value.' },
    ])
  })
})
