import { describe, expect, it } from 'vitest'

import {
  contentGrantsSchema,
  contentTraitSchema,
  innateSpellEntrySchema,
  speciesGrantsSchema,
} from './grants'

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

describe('contentTraitSchema', () => {
  it('parses a trait with optional grants', () => {
    const trait = {
      id: 'darkvision',
      name: 'Darkvision',
      description: '<p>You have Darkvision with a range of 60 feet.</p>',
      grants: { senses: [{ type: 'darkvision' as const, range: 60 }] },
    }
    expect(contentTraitSchema.parse(trait)).toEqual(trait)
  })
})

describe('speciesGrantsSchema alias', () => {
  it('is the same schema as contentGrantsSchema', () => {
    expect(speciesGrantsSchema).toBe(contentGrantsSchema)
  })
})
