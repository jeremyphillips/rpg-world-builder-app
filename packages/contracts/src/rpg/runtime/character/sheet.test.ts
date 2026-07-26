import { describe, expect, it } from 'vitest'

import { characterValidationMessages } from './character-messages'
import { characterSchema, getCharacterTotalLevel } from './sheet'
import { characterSelectionSourceSchema } from './selection-sources'
import {
  characterToolProficiencyEntrySchema,
  characterWeaponProficiencyEntrySchema,
} from './proficiencies'

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
    current: 58,
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
    languages: [
      {
        language: 'thieves-cant',
        sources: [
          {
            kind: 'classFeature',
            sourceId: 'srd-cc-5.2.1:rogue',
            grantId: 'thieves-cant',
          },
        ],
      },
      {
        language: 'elvish',
        sources: [
          {
            kind: 'classFeature',
            sourceId: 'srd-cc-5.2.1:ranger',
            grantId: 'roving',
          },
        ],
      },
    ],
  },
  spells: [
    {
      spellId: 'srd-cc-5.2.1:light',
      access: { granted: true },
      castingEntitlements: [
        {
          mode: 'free_cast',
          frequency: 'at_will',
          allowsSlotCasting: false,
          sources: [
            {
              kind: 'heritageOption',
              sourceId: 'srd-cc-5.2.1:elf',
              grantId: 'high-elf-cantrip',
            },
          ],
        },
      ],
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
  vital: { status: 'alive' },
  ...timestamps,
} as const

describe('characterSchema', () => {
  it('parses a valid user-owned player character', () => {
    const parsed = characterSchema.parse({
      ...baseCharacter,
      characterType: 'pc',
      userId: 'user_1',
    })

    expect(parsed.characterType).toBe('pc')
    expect(getCharacterTotalLevel(parsed)).toBe(7)
    expect(parsed.equipment.gear).toEqual([])
    expect(parsed.proficiencies.languages.map((entry) => entry.language)).toEqual([
      'thieves-cant',
      'elvish',
    ])
    expect(parsed.wealth).toEqual({ cp: 0, sp: 0, gp: 125, pp: 0 })
  })

  it('parses a valid campaign-owned NPC without a user owner', () => {
    const parsed = characterSchema.parse({
      ...baseCharacter,
      id: 'npc_1',
      characterType: 'npc',
    })

    expect(parsed.characterType).toBe('npc')
  })

  it('rejects a player character without a userId', () => {
    expect(
      characterSchema.safeParse({
        ...baseCharacter,
        characterType: 'pc',
      }).success,
    ).toBe(false)
  })

  it('rejects a user-owned NPC', () => {
    expect(
      characterSchema.safeParse({
        ...baseCharacter,
        characterType: 'npc',
        userId: 'user_1',
      }).success,
    ).toBe(false)
  })

  it('rejects duplicate class entries', () => {
    const result = characterSchema.safeParse({
      ...baseCharacter,
      characterType: 'pc',
      userId: 'user_1',
      classes: [
        { classId: 'srd-cc-5.2.1:fighter', level: 3 },
        { classId: 'srd-cc-5.2.1:fighter', level: 4 },
      ],
    })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues[0]?.message).toBe(characterValidationMessages.duplicateClass())
  })

  it('defaults omitted language proficiencies to an empty list', () => {
    const {
      proficiencies: { languages: _languages, ...proficienciesWithoutLanguages },
      ...withoutLanguageProficiencies
    } = baseCharacter

    const parsed = characterSchema.parse({
      ...withoutLanguageProficiencies,
      proficiencies: proficienciesWithoutLanguages,
      characterType: 'pc',
      userId: 'user_1',
    })

    expect(parsed.proficiencies.languages).toEqual([])
  })
})

describe('characterSelectionSourceSchema', () => {
  it('allows manual sources without a sourceId', () => {
    expect(characterSelectionSourceSchema.safeParse({ kind: 'manual' }).success).toBe(true)
  })

  it('requires sourceId for catalog-backed sources', () => {
    const result = characterSelectionSourceSchema.safeParse({ kind: 'feat' })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues[0]?.message).toBe(
      characterValidationMessages.selectionSourceIdRequired(),
    )
  })

  it('accepts character creation and starting wealth provenance kinds', () => {
    expect(
      characterSelectionSourceSchema.safeParse({
        kind: 'classStartingEquipment',
        sourceId: 'srd-cc-5.2.1:druid',
        grantId: 'standard-equipment',
      }).success,
    ).toBe(true)
    expect(
      characterSelectionSourceSchema.safeParse({
        kind: 'backgroundStartingEquipment',
        sourceId: 'srd-cc-5.2.1:acolyte',
        grantId: 'standard-equipment',
      }).success,
    ).toBe(true)
    expect(
      characterSelectionSourceSchema.safeParse({
        kind: 'startingWealthTier',
        sourceId: 'srd-cc-5.2.1:standard-starting-wealth',
        grantId: 'levels-5-10',
      }).success,
    ).toBe(true)
  })
})

describe('characterEquipmentEntrySchema', () => {
  it('accepts equipment modifiers on inventory rows', () => {
    expect(
      characterSchema.safeParse({
        ...baseCharacter,
        characterType: 'pc',
        userId: 'user_1',
        equipment: {
          ...baseCharacter.equipment,
          weapons: [
            {
              equipmentId: 'srd-cc-5.2.1:quarterstaff',
              modifiers: [{ kind: 'spellcasting_focus', spellcastingGearKind: 'druidic_focus' }],
              sources: [
                {
                  kind: 'classStartingEquipment',
                  sourceId: 'srd-cc-5.2.1:druid',
                  grantId: 'standard-equipment',
                },
              ],
            },
          ],
        },
      }).success,
    ).toBe(true)
  })
})

describe('character proficiency entries', () => {
  it('requires exactly one tool proficiency target', () => {
    const result = characterToolProficiencyEntrySchema.safeParse({
      toolId: 'srd-cc-5.2.1:dice-set',
      toolCategory: 'gaming_set',
      rank: 'proficient',
    })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues[0]?.message).toBe(
      characterValidationMessages.toolProficiencyExclusiveTarget(),
    )
  })

  it('requires exactly one weapon proficiency target', () => {
    const result = characterWeaponProficiencyEntrySchema.safeParse({
      rank: 'proficient',
    })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues[0]?.message).toBe(
      characterValidationMessages.weaponProficiencyExclusiveTarget(),
    )
  })
})
