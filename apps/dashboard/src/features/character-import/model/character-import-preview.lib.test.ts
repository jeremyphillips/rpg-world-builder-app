import { describe, expect, it } from 'vitest'

import {
  EXTRACTION_UNSET_DISPLAY_VALUE,
  extractionValueTone,
  formatClassesValue,
  formatDispositionSummary,
  formatExtractionDisplayValue,
  formatNarrativeFieldValue,
  formatProficiencyLabel,
  formatSupportedEquipmentValue,
  groupCoverageEntries,
  partitionCoverageEntries,
  partitionDispositionEntries,
  partitionEquipmentItems,
  shouldShowExtractionIssue,
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
  it('uses muted tone for missing extraction values', () => {
    expect(extractionValueTone(missingAlignment)).toBe('informative')
    expect(formatExtractionDisplayValue('alignment', missingAlignment)).toBe(
      EXTRACTION_UNSET_DISPLAY_VALUE,
    )
    expect(shouldShowExtractionIssue(missingAlignment)).toBe(false)
  })

  it('uses neutral tone for mapped extraction values', () => {
    expect(extractionValueTone(mappedName)).toBe('neutral')
    expect(formatExtractionDisplayValue('name', mappedName)).toBe('Presto')
  })

  it('formats narrative child fields as not set when absent', () => {
    expect(formatNarrativeFieldValue(undefined, 'ideals')).toEqual({
      displayValue: EXTRACTION_UNSET_DISPLAY_VALUE,
      isUnset: true,
    })
    expect(formatNarrativeFieldValue({ ideals: ['Honor above all.'] }, 'ideals')).toEqual({
      displayValue: 'Honor above all.',
      isUnset: false,
    })
  })

  it('partitions equipment into supported and unsupported groups', () => {
    const { supported, unsupported } = partitionEquipmentItems([
      {
        sourceValue: 'Backpack',
        sourceLabel: 'Backpack',
        quantity: 2,
        status: 'mapped',
      },
      {
        sourceValue: "Assassin's Blood (Ingested)",
        sourceLabel: "Assassin's Blood (Ingested)",
        quantity: 1,
        status: 'unresolved-reference',
      },
    ])

    expect(supported).toHaveLength(1)
    expect(unsupported).toHaveLength(1)
    expect(formatSupportedEquipmentValue(supported)).toBe('2x Backpack')
  })

  it('formats mapped class and species extraction values without catalog ids', () => {
    const mappedClasses = {
      status: 'mapped' as const,
      value: [
        {
          sourceValue: 'Wizard',
          level: 1,
          localValue: 'srd-cc-5.2.1:wizard',
          status: 'mapped' as const,
        },
      ],
      sourcePaths: ['data.classes'],
      issues: [],
    }

    expect(formatExtractionDisplayValue('classes', mappedClasses)).toBe('Wizard · Level 1')
    expect(
      formatClassesValue([
        {
          sourceValue: 'Fighter',
          level: 2,
          localValue: 'srd-cc-5.2.1:fighter',
          subclassSourceValue: 'Champion',
          subclassLocalValue: 'srd-cc-5.2.1:champion',
          status: 'mapped',
        },
      ]),
    ).toBe('Fighter · Level 2 (Champion)')
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
