import { describe, expect, it } from 'vitest'

import { formatEnumDescription, termOptionsFromEntries, vocabEnumFromEntries } from './enum-schema'
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
  it('formats markdown bullets from entry descriptions', () => {
    expect(formatEnumDescription(SAMPLE_ENTRIES)).toBe(
      '- **alpha**: First value.\n- **beta**: Second value.',
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

describe('termOptionsFromEntries', () => {
  it('returns value, label, and description for each entry', () => {
    expect(termOptionsFromEntries(SAMPLE_ENTRIES)).toEqual([
      { value: 'alpha', label: 'Alpha', description: 'First value.' },
      { value: 'beta', label: 'Beta', description: 'Second value.' },
    ])
  })
})
