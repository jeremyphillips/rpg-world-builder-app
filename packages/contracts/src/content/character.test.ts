import { describe, expect, it } from 'vitest'

import {
  characterSchema,
  characterSelectionSourceSchema,
  characterToolProficiencyEntrySchema,
  characterWeaponProficiencyEntrySchema,
  getCharacterTotalLevel,
} from './character'

const timestamps = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

const baseCharacter = {
  id: 'char_1',
  name: 'Seren',
  rulesetId: 'srd-cc-5.2.1',
  classes: [
    {
      classId: 'srd-cc-5.2.1:fighter',
      subclassId: 'srd-cc-5.2.1:champion',
      level: 7,
    },
  ],
  species: {
    id: 'srd-cc-5.2.1:elf',
    heritageId: 'high-elf',
  },
  alignment: 'ng',
  xp: 23000,
  abilityScores: {
    str: 16,
    dex: 14,
    con: 15,
    int: 10,
    wis: 12,
    cha: 8,
  },
  hitPoints: {
    base: 58,
    temporary: 0,
  },
  proficiencies: {
    skills: [
      {
        skill: 'athletics',
        rank: 'expertise',
        sources: [
          {
            kind: 'classFeature',
            sourceId: 'srd-cc-5.2.1:fighter',
            grantId: 'skill-proficiencies',
          },
          {
            kind: 'feat',
            sourceId: 'srd-cc-5.2.1:skill-expert',
          },
        ],
      },
    ],
    weapons: [
      {
        weaponCategory: 'martial',
        rank: 'mastery',
        sources: [
          {
            kind: 'classFeature',
            sourceId: 'srd-cc-5.2.1:fighter',
            grantId: 'weapon-mastery',
          },
        ],
      },
    ],
    armor: [
      {
        armorCategory: 'light',
      },
    ],
    tools: [
      {
        toolCategory: 'gaming_set',
        rank: 'proficient',
        sources: [{ kind: 'manual', notes: 'Campaign award' }],
      },
    ],
  },
  spells: [
    {
      spellId: 'srd-cc-5.2.1:light',
      preparationState: 'always_prepared',
      sources: [
        {
          kind: 'heritageOption',
          sourceId: 'srd-cc-5.2.1:elf',
          grantId: 'high-elf-cantrip',
        },
      ],
    },
  ],
  equipment: {
    weapons: [
      {
        entryId: 'inventory_1',
        equipmentId: 'srd-cc-5.2.1:longsword',
        equipped: true,
      },
    ],
    magicItems: [
      {
        entryId: 'inventory_2',
        equipmentId: 'srd-cc-5.2.1:cloak-of-elvenkind',
        attuned: true,
        customName: 'Moonthread Cloak',
      },
    ],
  },
  wealth: {
    gp: 125,
  },
  narrative: {
    personalityTraits: ['Quiet until steel is drawn'],
    backstory: 'A veteran of border skirmishes.',
  },
  feats: [
    {
      featId: 'srd-cc-5.2.1:defensive-duelist',
      sources: [
        {
          kind: 'classFeature',
          sourceId: 'srd-cc-5.2.1:fighter',
          grantId: 'additional-fighting-style',
        },
      ],
      choices: {
        fightingStyle: 'defense',
      },
    },
  ],
  ...timestamps,
} as const

describe('characterSchema', () => {
  it('parses a valid user-owned player character', () => {
    const parsed = characterSchema.parse({
      ...baseCharacter,
      characterType: 'pc',
      userId: 'user_1',
      campaignId: 'camp_1',
    })

    expect(parsed.characterType).toBe('pc')
    expect(getCharacterTotalLevel(parsed)).toBe(7)
    expect(parsed.equipment.gear).toEqual([])
    expect(parsed.wealth).toEqual({ cp: 0, sp: 0, gp: 125, pp: 0 })
  })

  it('parses a valid campaign-owned NPC without a user owner', () => {
    const parsed = characterSchema.parse({
      ...baseCharacter,
      id: 'npc_1',
      characterType: 'npc',
      campaignId: 'camp_1',
    })

    expect(parsed.characterType).toBe('npc')
    expect(parsed.campaignId).toBe('camp_1')
  })

  it('rejects a player character without a userId', () => {
    expect(
      characterSchema.safeParse({
        ...baseCharacter,
        characterType: 'pc',
        campaignId: 'camp_1',
      }).success,
    ).toBe(false)
  })

  it('rejects an NPC without a campaignId', () => {
    expect(
      characterSchema.safeParse({
        ...baseCharacter,
        characterType: 'npc',
      }).success,
    ).toBe(false)
  })

  it('rejects a user-owned NPC', () => {
    expect(
      characterSchema.safeParse({
        ...baseCharacter,
        characterType: 'npc',
        campaignId: 'camp_1',
        userId: 'user_1',
      }).success,
    ).toBe(false)
  })

  it('rejects duplicate class entries', () => {
    expect(
      characterSchema.safeParse({
        ...baseCharacter,
        characterType: 'pc',
        userId: 'user_1',
        classes: [
          { classId: 'srd-cc-5.2.1:fighter', level: 3 },
          { classId: 'srd-cc-5.2.1:fighter', level: 4 },
        ],
      }).success,
    ).toBe(false)
  })
})

describe('characterSelectionSourceSchema', () => {
  it('allows manual sources without a sourceId', () => {
    expect(characterSelectionSourceSchema.safeParse({ kind: 'manual' }).success).toBe(true)
  })

  it('requires sourceId for catalog-backed sources', () => {
    expect(characterSelectionSourceSchema.safeParse({ kind: 'feat' }).success).toBe(false)
  })
})

describe('character proficiency entries', () => {
  it('requires exactly one tool proficiency target', () => {
    expect(
      characterToolProficiencyEntrySchema.safeParse({
        toolId: 'srd-cc-5.2.1:dice-set',
        toolCategory: 'gaming_set',
        rank: 'proficient',
      }).success,
    ).toBe(false)
  })

  it('requires exactly one weapon proficiency target', () => {
    expect(
      characterWeaponProficiencyEntrySchema.safeParse({
        rank: 'proficient',
      }).success,
    ).toBe(false)
  })
})
