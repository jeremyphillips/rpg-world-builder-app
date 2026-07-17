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
  movement: { walk: 30 },
  traits: [
    {
      kind: 'grant' as const,
      id: 'darkvision',
      grantGroups: [{ grants: [{ kind: 'sense' as const, type: 'darkvision', range: 60 }] }],
    },
    {
      kind: 'custom' as const,
      id: 'fey-ancestry',
      name: 'Fey Ancestry',
      description:
        '<p>You have Advantage on saving throws to avoid or end the Charmed condition.</p>',
    },
  ],
  heritage: {
    id: 'elven-lineage',
    name: 'Elven Lineage',
    description: '<p>Your lineage shapes your connection to elven magic.</p>',
    options: [
      {
        kind: 'custom' as const,
        id: 'drow',
        name: 'Drow',
        description: '<p>Drow trace their lineage to the Underdark.</p>',
        grantGroups: [
          {
            grants: [{ kind: 'sense' as const, type: 'darkvision', range: 120 }],
          },
          {
            unlock: { level: 1 },
            grants: [
              {
                kind: 'spells' as const,
                ability: 'cha',
                mode: 'free_cast',
                frequency: 'at_will',
                spellIds: ['dancing-lights'],
              },
            ],
          },
          {
            unlock: { level: 3 },
            grants: [
              {
                kind: 'spells' as const,
                ability: 'cha',
                mode: 'free_cast',
                frequency: 'once_per_long_rest',
                spellIds: ['faerie-fire'],
              },
            ],
          },
        ],
      },
      {
        kind: 'custom' as const,
        id: 'wood-elf',
        name: 'Wood Elf',
        description: '<p>Your Speed is 35 feet.</p>',
        grantGroups: [
          {
            grants: [
              {
                kind: 'movement' as const,
                mode: 'walk',
                operation: 'increase',
                feet: 5,
              },
            ],
          },
        ],
      },
    ],
  },
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
    if (result.success) {
      expect(result.data.heritage?.choose).toBe(1)
    }
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

    const { movement: _movement, ...missingMovement } = ELF_SYSTEM
    expect(speciesSchema.safeParse(missingMovement).success).toBe(false)

    expect(speciesSchema.safeParse({ ...ELF_SYSTEM, sizes: [] }).success).toBe(false)
  })

  it('allows optional body fields to be omitted', () => {
    const minimal = {
      ...ELF_SYSTEM,
      description: undefined,
      imageKey: undefined,
      heritage: undefined,
    }
    expect(speciesSchema.safeParse(minimal).success).toBe(true)
  })

  it('parses optional languageAffinities', () => {
    const withAffinities = { ...ELF_SYSTEM, languageAffinities: ['elvish'] }
    expect(speciesSchema.safeParse(withAffinities).success).toBe(true)
    expect(speciesSchema.parse(withAffinities).languageAffinities).toEqual(['elvish'])

    expect(
      speciesSchema.safeParse({ ...ELF_SYSTEM, languageAffinities: ['not a language id'] }).success,
    ).toBe(false)
  })

  it('rejects invalid creature type slug shapes', () => {
    expect(speciesSchema.safeParse({ ...ELF_SYSTEM, creatureType: 'Bad Type' }).success).toBe(false)
    expect(speciesSchema.safeParse({ ...ELF_SYSTEM, sizes: ['colossal'] }).success).toBe(false)
  })

  it('accepts slug-shaped creature types before catalog membership validation', () => {
    expect(speciesSchema.safeParse({ ...ELF_SYSTEM, creatureType: 'robot' }).success).toBe(true)
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
    expect(updateSpeciesInputSchema.safeParse({ movement: { walk: 25 } }).success).toBe(true)
  })
})

describe('speciesPatchSchema', () => {
  it('requires campaignId and targetId', () => {
    const base = {
      id: 'patch-1',
      createdAt: '2024-05-21T00:00:00.000Z',
      updatedAt: '2024-05-21T00:00:00.000Z',
      patch: { movement: { walk: 25 } },
    }
    expect(speciesPatchSchema.safeParse(base).success).toBe(false)
    expect(
      speciesPatchSchema.safeParse({ ...base, campaignId: 'camp-1', targetId: 'srd-cc-5.2.1:elf' })
        .success,
    ).toBe(true)
  })
})
