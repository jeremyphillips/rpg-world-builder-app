import { describe, expect, it } from 'vitest'

import {
  defaultSpeciesLevelLimits,
  defaultSpeciesMulticlassing,
  speciesCharacterCreationSchema,
  speciesClassPolicySchema,
  speciesLevelLimitsSchema,
} from './species-character-creation'
import { speciesSchema } from './species'

const ELF_SYSTEM = {
  id: 'srd-cc-5.2.1:elf',
  slug: 'elf',
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'system' as const,
  campaignId: null,
  createdAt: '2024-05-21T00:00:00.000Z',
  updatedAt: '2024-05-21T00:00:00.000Z',
  name: 'Elf',
  creatureType: 'humanoid',
  sizes: ['medium'],
  movement: { walk: 30 },
  traits: [],
}

describe('defaults', () => {
  it('produce inherit policy and no level caps', () => {
    expect(defaultSpeciesMulticlassing()).toEqual({
      policy: 'inherit',
      classPolicy: { mode: 'all', classIds: [] },
    })
    expect(defaultSpeciesLevelLimits()).toEqual({ maxCharacterLevel: null, classLevelCaps: [] })
  })
})

describe('speciesClassPolicySchema', () => {
  it('requires class ids for only / all_except modes', () => {
    expect(speciesClassPolicySchema.safeParse({ mode: 'all', classIds: [] }).success).toBe(true)
    expect(speciesClassPolicySchema.safeParse({ mode: 'only', classIds: [] }).success).toBe(false)
    expect(
      speciesClassPolicySchema.safeParse({ mode: 'all_except', classIds: ['wizard'] }).success,
    ).toBe(true)
  })
})

describe('speciesLevelLimitsSchema', () => {
  it('allows a null character-level cap and empty caps', () => {
    expect(
      speciesLevelLimitsSchema.safeParse({ maxCharacterLevel: null, classLevelCaps: [] }).success,
    ).toBe(true)
  })

  it('rejects duplicate class level caps', () => {
    const result = speciesLevelLimitsSchema.safeParse({
      maxCharacterLevel: 12,
      classLevelCaps: [
        { classId: 'fighter', maxLevel: 9 },
        { classId: 'fighter', maxLevel: 4 },
      ],
    })
    expect(result.success).toBe(false)
  })
})

describe('speciesCharacterCreationSchema', () => {
  it('accepts both blocks present and is strict on unknown keys', () => {
    expect(
      speciesCharacterCreationSchema.safeParse({
        multiclassing: defaultSpeciesMulticlassing(),
        levelLimits: defaultSpeciesLevelLimits(),
      }).success,
    ).toBe(true)
    expect(speciesCharacterCreationSchema.safeParse({ unknown: true }).success).toBe(false)
  })
})

describe('species body integration', () => {
  it('accepts an optional characterCreation block on a species record', () => {
    expect(
      speciesSchema.safeParse({
        ...ELF_SYSTEM,
        characterCreation: {
          multiclassing: {
            policy: 'restricted',
            classPolicy: { mode: 'only', classIds: ['wizard'] },
          },
          levelLimits: {
            maxCharacterLevel: null,
            classLevelCaps: [{ classId: 'fighter', maxLevel: 9 }],
          },
        },
      }).success,
    ).toBe(true)
  })

  it('still parses species without characterCreation', () => {
    expect(speciesSchema.safeParse(ELF_SYSTEM).success).toBe(true)
  })
})
