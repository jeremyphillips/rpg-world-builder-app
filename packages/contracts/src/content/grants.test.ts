import { describe, expect, it } from 'vitest'

import {
  contentGrantsSchema,
  contentTraitSchema,
  customContentTraitSchema,
  grantContentTraitSchema,
  innateSpellEntrySchema,
  isGrantEligibleGrants,
  normalizeContentTrait,
  speciesGrantsSchema,
} from './grants'
import { resolveTraitDisplay } from './trait-display'

describe('isGrantEligibleGrants', () => {
  it('accepts a single sense grant', () => {
    expect(isGrantEligibleGrants({ senses: [{ type: 'darkvision', range: 60 }] })).toBe(true)
  })

  it('rejects multi-key grant bags', () => {
    expect(
      isGrantEligibleGrants({
        senses: [{ type: 'darkvision', range: 120 }],
        innateSpells: {
          ability: 'cha',
          entries: [{ level: 1, kind: 'free_cast' as const, spellIds: ['dancing-lights'] }],
        },
      }),
    ).toBe(false)
  })

  it('rejects innateSpells-only grants', () => {
    expect(
      isGrantEligibleGrants({
        innateSpells: {
          ability: 'cha',
          entries: [{ level: 1, kind: 'free_cast' as const, spellIds: ['dancing-lights'] }],
        },
      }),
    ).toBe(false)
  })
})

describe('innateSpellEntrySchema', () => {
  it('defaults kind to free_cast when omitted', () => {
    const result = innateSpellEntrySchema.parse({
      level: 1,
      spellIds: ['dancing-lights'],
      frequency: 'at_will',
    })
    expect(result.kind).toBe('free_cast')
  })

  it('parses free_cast with frequency', () => {
    expect(
      innateSpellEntrySchema.safeParse({
        level: 3,
        spellIds: ['faerie-fire'],
        kind: 'free_cast',
        frequency: 'once_per_long_rest',
      }).success,
    ).toBe(true)
  })

  it('parses always_prepared without frequency', () => {
    const result = innateSpellEntrySchema.parse({
      level: 20,
      kind: 'always_prepared',
      spellIds: ['power-word-heal', 'power-word-kill'],
    })
    expect(result).toEqual({
      level: 20,
      kind: 'always_prepared',
      spellIds: ['power-word-heal', 'power-word-kill'],
    })
  })

  it('rejects always_prepared with frequency', () => {
    expect(
      innateSpellEntrySchema.safeParse({
        level: 20,
        kind: 'always_prepared',
        spellIds: ['power-word-heal'],
        frequency: 'at_will',
      }).success,
    ).toBe(false)
  })
})

describe('contentGrantsSchema', () => {
  it('parses a grants bag with innateSpells', () => {
    const grants = {
      innateSpells: {
        ability: 'cha' as const,
        entries: [
          {
            level: 20,
            kind: 'always_prepared' as const,
            spellIds: ['power-word-heal', 'power-word-kill'],
          },
        ],
      },
    }
    expect(contentGrantsSchema.parse(grants)).toEqual(grants)
  })
})

describe('customContentTraitSchema', () => {
  it('parses a custom trait with optional grants', () => {
    const trait = {
      kind: 'custom' as const,
      id: 'fey-ancestry',
      name: 'Fey Ancestry',
      description: '<p>Advantage on Charm saves.</p>',
    }
    expect(customContentTraitSchema.parse(trait)).toEqual(trait)
  })
})

describe('grantContentTraitSchema', () => {
  it('parses a grant-only darkvision trait', () => {
    const trait = {
      kind: 'grant' as const,
      id: 'darkvision',
      grants: { senses: [{ type: 'darkvision' as const, range: 60 }] },
    }
    expect(grantContentTraitSchema.parse(trait)).toEqual(trait)
  })

  it('rejects ineligible grants', () => {
    expect(
      grantContentTraitSchema.safeParse({
        kind: 'grant',
        id: 'drow',
        grants: {
          senses: [{ type: 'darkvision', range: 120 }],
          innateSpells: {
            ability: 'cha',
            entries: [{ level: 1, spellIds: ['dancing-lights'] }],
          },
        },
      }).success,
    ).toBe(false)
  })
})

describe('contentTraitSchema', () => {
  it('parses grant and custom variants', () => {
    expect(
      contentTraitSchema.parse({
        kind: 'grant',
        id: 'darkvision',
        grants: { senses: [{ type: 'darkvision', range: 60 }] },
      }),
    ).toMatchObject({ kind: 'grant', id: 'darkvision' })

    expect(
      contentTraitSchema.parse({
        kind: 'custom',
        id: 'rage',
        name: 'Rage',
        description: '<p>Enter a rage.</p>',
      }),
    ).toMatchObject({ kind: 'custom', name: 'Rage' })
  })

  it('normalizes legacy traits without kind to custom', () => {
    const trait = {
      id: 'darkvision',
      name: 'Darkvision',
      description: '<p>You have Darkvision with a range of 60 feet.</p>',
      grants: { senses: [{ type: 'darkvision' as const, range: 60 }] },
    }
    expect(contentTraitSchema.parse(trait)).toEqual({
      ...trait,
      kind: 'custom',
    })
  })
})

describe('normalizeContentTrait', () => {
  it('leaves explicit kind unchanged', () => {
    expect(
      normalizeContentTrait({
        kind: 'grant',
        id: 'darkvision',
        grants: { senses: [{ type: 'darkvision', range: 60 }] },
      }),
    ).toMatchObject({ kind: 'grant' })
  })
})

describe('resolveTraitDisplay', () => {
  it('derives darkvision display from grant traits', () => {
    const display = resolveTraitDisplay(
      contentTraitSchema.parse({
        kind: 'grant',
        id: 'darkvision',
        grants: { senses: [{ type: 'darkvision', range: 60 }] },
      }),
    )
    expect(display.name).toBe('Darkvision')
    expect(display.descriptionHtml).toBe('<p>You have Darkvision with a range of 60 feet.</p>')
  })

  it('uses overrides on grant traits when present', () => {
    const display = resolveTraitDisplay(
      grantContentTraitSchema.parse({
        kind: 'grant',
        id: 'darkvision',
        grants: { senses: [{ type: 'darkvision', range: 120 }] },
        nameOverride: 'Superior Darkvision',
        descriptionOverride: '<p>Custom homebrew wording.</p>',
      }),
    )
    expect(display.name).toBe('Superior Darkvision')
    expect(display.descriptionHtml).toBe('<p>Custom homebrew wording.</p>')
  })
})

describe('speciesGrantsSchema alias', () => {
  it('is the same schema as contentGrantsSchema', () => {
    expect(speciesGrantsSchema).toBe(contentGrantsSchema)
  })
})
