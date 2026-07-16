import { describe, expect, it } from 'vitest'

import {
  extractionFieldTone,
  formatDispositionSummary,
  formatExtractionDisplayValue,
  formatProficiencyLabel,
  groupCoverageEntries,
  partitionCoverageEntries,
  partitionDispositionEntries,
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

  it('partitions ignored and unsupported disposition entries', () => {
    const { ignored, unsupported } = partitionDispositionEntries([
      {
        sourcePath: 'data.modifiers.class[0]',
        sourceValue: 'intelligence-saving-throws',
        disposition: 'ignored',
        reason: 'resolved-from-local-content',
        message: 'ignored',
      },
      {
        sourcePath: 'data.modifiers.feat[0]',
        sourceValue: 'mystery-proficiency',
        disposition: 'unsupported',
        reason: 'not-in-local-contract',
        message: 'unsupported',
      },
    ])

    expect(ignored).toHaveLength(1)
    expect(unsupported).toHaveLength(1)
    expect(formatDispositionSummary(ignored[0]!)).toBe(
      'intelligence-saving-throws — resolved from local content',
    )
  })

  it('groups readiness coverage entries by type', () => {
    const groups = groupCoverageEntries([
      { targetPath: 'name', state: 'mapped', reason: 'ok' },
      { targetPath: 'classes', state: 'unresolved-reference', reason: 'catalog' },
      { targetPath: 'campaignId', state: 'deferred', reason: 'save' },
    ])

    expect(groups.map((group) => group.id)).toEqual(['core', 'catalog', 'context'])
  })

  it('formats tool proficiencies with category labels', () => {
    expect(
      formatProficiencyLabel({
        kind: 'tool',
        sourceValue: 'calligraphers-supplies',
        toolCategory: 'artisan',
        sourceGroup: 'background',
        status: 'mapped',
      }),
    ).toBe("Artisan's Tools")
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
