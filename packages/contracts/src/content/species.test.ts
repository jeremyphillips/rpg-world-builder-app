import { describe, expect, it } from 'vitest'

import {
  createSpeciesInputSchema,
  speciesPatchSchema,
  speciesSchema,
  updateSpeciesInputSchema,
} from './species'

const ELF_BODY = {
  name: 'Elf',
  description: '<p>A race of graceful and elegant beings.</p>',
  imageKey: '/assets/system/species/elf.webp',
  creatureType: 'humanoid',
  sizes: ['medium'],
  speed: { walk: 30 },
  traits: [
    {
      id: 'darkvision',
      name: 'Darkvision',
      description: '<p>You have Darkvision with a range of 60 feet.</p>',
      grants: { senses: [{ type: 'darkvision', range: 60 }] },
    },
    {
      id: 'fey-ancestry',
      name: 'Fey Ancestry',
      description:
        '<p>You have Advantage on saving throws to avoid or end the Charmed condition.</p>',
    },
  ],
  heritageChoices: [
    {
      id: 'elven-lineage',
      name: 'Elven Lineage',
      kind: 'lineage' as const,
      description: '<p>Your lineage shapes your connection to elven magic.</p>',
      options: [
        {
          id: 'drow',
          name: 'Drow',
          description: '<p>Drow trace their lineage to the Underdark.</p>',
          grants: {
            senses: [{ type: 'darkvision' as const, range: 120 }],
            innateSpells: {
              ability: 'cha' as const,
              entries: [
                { level: 1, spellIds: ['dancing-lights'], frequency: 'at_will' as const },
                { level: 3, spellIds: ['faerie-fire'], frequency: 'once_per_long_rest' as const },
              ],
            },
          },
        },
        {
          id: 'wood-elf',
          name: 'Wood Elf',
          description: '<p>Your Speed is 35 feet.</p>',
          grants: { speedOverride: { walk: 35 } },
        },
      ],
    },
  ],
}

const ELF_SYSTEM = {
  id: 'srd-cc-5.2.1:elf',
  slug: 'elf',
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'system' as const,
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  ...ELF_BODY,
}

describe('speciesSchema', () => {
  it('parses a well-formed system record (with lineage grants)', () => {
    const result = speciesSchema.safeParse(ELF_SYSTEM)
    expect(result.success).toBe(true)
  })

  it('parses a homebrew record with a campaignId', () => {
    const homebrew = {
      ...ELF_SYSTEM,
      id: 'abc123',
      source: 'homebrew' as const,
      campaignId: 'camp-1',
    }
    expect(speciesSchema.safeParse(homebrew).success).toBe(true)
  })

  it('requires core fields', () => {
    const { creatureType: _creatureType, ...missingType } = ELF_SYSTEM
    expect(speciesSchema.safeParse(missingType).success).toBe(false)

    const { speed: _speed, ...missingSpeed } = ELF_SYSTEM
    expect(speciesSchema.safeParse(missingSpeed).success).toBe(false)

    expect(speciesSchema.safeParse({ ...ELF_SYSTEM, sizes: [] }).success).toBe(false)
  })

  it('allows optional body fields to be omitted', () => {
    const minimal = {
      ...ELF_SYSTEM,
      description: undefined,
      imageKey: undefined,
      heritageChoices: undefined,
    }
    expect(speciesSchema.safeParse(minimal).success).toBe(true)
  })

  it('rejects an unknown creature type or size', () => {
    expect(speciesSchema.safeParse({ ...ELF_SYSTEM, creatureType: 'robot' }).success).toBe(false)
    expect(speciesSchema.safeParse({ ...ELF_SYSTEM, sizes: ['colossal'] }).success).toBe(false)
  })
})

describe('createSpeciesInputSchema', () => {
  it('requires and validates a slug', () => {
    expect(createSpeciesInputSchema.safeParse(ELF_BODY).success).toBe(false)
    expect(createSpeciesInputSchema.safeParse({ ...ELF_BODY, slug: 'elf' }).success).toBe(true)
    expect(createSpeciesInputSchema.safeParse({ ...ELF_BODY, slug: 'Bad Slug' }).success).toBe(
      false,
    )
  })
})

describe('updateSpeciesInputSchema', () => {
  it('allows partial updates', () => {
    expect(updateSpeciesInputSchema.safeParse({}).success).toBe(true)
    expect(updateSpeciesInputSchema.safeParse({ speed: { walk: 25 } }).success).toBe(true)
  })
})

describe('speciesPatchSchema', () => {
  it('requires campaignId and targetId', () => {
    const base = {
      id: 'patch-1',
      createdAt: '2024-05-21T00:00:00.000Z',
      updatedAt: '2024-05-21T00:00:00.000Z',
      patch: { speed: { walk: 25 } },
    }
    expect(speciesPatchSchema.safeParse(base).success).toBe(false)
    expect(
      speciesPatchSchema.safeParse({ ...base, campaignId: 'camp-1', targetId: 'srd-cc-5.2.1:elf' })
        .success,
    ).toBe(true)
  })
})
