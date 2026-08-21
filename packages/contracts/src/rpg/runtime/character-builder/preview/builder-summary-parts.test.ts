import { describe, expect, it } from 'vitest'

import { formatCharacterSummary } from '../../character/summary/character-summary-format'
import { resolveBuilderCharacterSummaryParts } from './builder-summary-parts'

const lookup = {
  speciesName: (id: string) => {
    const names: Record<string, string> = {
      'srd-cc-5.2.1:dwarf': 'Dwarf',
      'srd-cc-5.2.1:elf': 'Elf',
    }
    return names[id]
  },
  heritageName: (_speciesId: string, heritageId: string) => {
    const names: Record<string, string> = {
      drow: 'Drow',
    }
    return names[heritageId]
  },
  className: (id: string) => {
    const names: Record<string, string> = {
      'srd-cc-5.2.1:fighter': 'Fighter',
      'srd-cc-5.2.1:rogue': 'Rogue',
    }
    return names[id]
  },
  subclassName: (id: string) => {
    const names: Record<string, string> = {
      'srd-cc-5.2.1:champion': 'Champion',
    }
    return names[id]
  },
} as const

describe('resolveBuilderCharacterSummaryParts', () => {
  it('supports incomplete builder drafts', () => {
    expect(
      formatCharacterSummary(
        resolveBuilderCharacterSummaryParts(
          {
            species: { speciesId: 'srd-cc-5.2.1:dwarf' },
            class: { level: 4 },
          },
          lookup,
        ),
      ),
    ).toBe('Dwarf')

    expect(
      formatCharacterSummary(
        resolveBuilderCharacterSummaryParts(
          {
            species: {},
            class: { classId: 'srd-cc-5.2.1:fighter', level: 4 },
          },
          lookup,
        ),
      ),
    ).toBe('Level 4 Fighter')

    expect(
      formatCharacterSummary(
        resolveBuilderCharacterSummaryParts(
          {
            species: { speciesId: 'srd-cc-5.2.1:elf' },
            class: { level: 0 },
          },
          lookup,
        ),
      ),
    ).toBe('Elf · Level 0')
  })
})
