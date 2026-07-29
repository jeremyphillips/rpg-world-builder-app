import { describe, expect, it } from 'vitest'

import { formatCharacterSummary } from './character-summary-format'
import {
  resolveBuilderCharacterSummaryParts,
  resolveCharacterSummaryParts,
} from './resolve-character-summary-parts'

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

describe('resolveCharacterSummaryParts', () => {
  it('maps persisted character ids into summary parts', () => {
    expect(
      resolveCharacterSummaryParts(
        {
          species: { id: 'srd-cc-5.2.1:dwarf' },
          classes: [{ classId: 'srd-cc-5.2.1:fighter', level: 4 }],
        },
        lookup,
      ),
    ).toEqual({
      species: { name: 'Dwarf' },
      classes: [{ name: 'Fighter', level: 4 }],
    })
  })

  it('includes heritage and subclass labels when present', () => {
    expect(
      resolveCharacterSummaryParts(
        {
          species: { id: 'srd-cc-5.2.1:elf', heritageId: 'drow' },
          classes: [
            {
              classId: 'srd-cc-5.2.1:fighter',
              subclassId: 'srd-cc-5.2.1:champion',
              level: 3,
            },
          ],
        },
        lookup,
      ),
    ).toEqual({
      species: { name: 'Elf', heritageName: 'Drow' },
      classes: [{ name: 'Fighter', level: 3, subclassName: 'Champion' }],
    })
  })

  it('formats resolved parts with the shared formatter', () => {
    const parts = resolveCharacterSummaryParts(
      {
        species: { id: 'srd-cc-5.2.1:dwarf' },
        classes: [{ classId: 'srd-cc-5.2.1:fighter', level: 4 }],
      },
      lookup,
    )

    expect(formatCharacterSummary(parts)).toBe('Dwarf · Level 4 Fighter')
  })
})

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
  })
})
