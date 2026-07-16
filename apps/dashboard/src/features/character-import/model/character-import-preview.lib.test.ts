import { describe, expect, it } from 'vitest'

import {
  extractionFieldTone,
  formatExtractionDisplayValue,
  partitionCoverageEntries,
} from './character-import-preview.lib'

const mappedName = {
  status: 'mapped' as const,
  value: 'Presto',
  sourcePaths: ['data.name'],
  issues: [],
}

const missingAlignment = {
  status: 'missing-source' as const,
  sourcePaths: ['data.alignmentId'],
  issues: ['Alignment is not set on the source character.'],
}

describe('character-import-preview.lib', () => {
  it('uses negative tone for missing extraction values', () => {
    expect(extractionFieldTone(missingAlignment)).toBe('negative')
    expect(formatExtractionDisplayValue('alignment', missingAlignment)).toBe('Undefined')
  })

  it('uses neutral tone for mapped extraction values', () => {
    expect(extractionFieldTone(mappedName)).toBe('neutral')
    expect(formatExtractionDisplayValue('name', mappedName)).toBe('Presto')
  })

  it('partitions server-owned coverage entries', () => {
    const { readiness, providedWhenSaved } = partitionCoverageEntries([
      { targetPath: 'name', state: 'mapped', reason: 'ok' },
      { targetPath: 'id', state: 'server-owned', reason: 'assigned on save' },
    ])

    expect(readiness).toHaveLength(1)
    expect(providedWhenSaved).toHaveLength(1)
    expect(providedWhenSaved[0]?.targetPath).toBe('id')
  })
})
