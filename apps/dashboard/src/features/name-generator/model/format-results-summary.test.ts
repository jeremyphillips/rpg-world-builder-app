import { describe, expect, it } from 'vitest'

import { composeNameGeneratorConventions } from './compose-name-generator-conventions'
import { formatMatchCountLabel, formatResultsSummary } from './format-results-summary'

const ELF_SPECIES = {
  id: 'srd-cc-5.2.1:elf',
  slug: 'elf',
  name: 'Elf',
  source: 'system' as const,
  status: 'published',
  culture: {
    id: 'elven',
    name: 'Elven',
    naming: { supported: true, personalNameComponents: ['family' as const] },
  },
  languageAffinities: ['elvish'],
}

const { getConvention } = composeNameGeneratorConventions([ELF_SPECIES])

describe('formatMatchCountLabel', () => {
  it('formats zero, one, and many matches', () => {
    expect(formatMatchCountLabel(0)).toBe('No naming conventions match these filters.')
    expect(formatMatchCountLabel(1)).toBe('1 matching naming convention')
    expect(formatMatchCountLabel(3)).toBe('3 matching naming conventions')
  })
})

describe('formatResultsSummary', () => {
  it('formats a single convention summary', () => {
    expect(
      formatResultsSummary(
        {
          subjectKind: 'person',
          languageId: 'elvish',
          speciesId: 'srd-cc-5.2.1:elf',
          genderStyle: 'feminine',
        },
        [{ conventionId: 'elvish-personal', score: 20, reasons: [] }],
        undefined,
        getConvention,
      ),
    ).toEqual({
      title: 'Elven personal names',
      subtitle: 'Elvish · Elf · Feminine',
    })
  })

  it('formats a partial batch warning', () => {
    expect(
      formatResultsSummary(
        { subjectKind: 'person' },
        [{ conventionId: 'elvish-personal', score: 20, reasons: [] }],
        { generated: 6, requested: 10 },
      ),
    ).toEqual({
      title: 'Generated 6 of 10 unique names.',
      tone: 'warning',
    })
  })
})
