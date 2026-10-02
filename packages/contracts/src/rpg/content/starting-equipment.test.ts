import { describe, expect, it } from 'vitest'

import {
  classCharacterCreationSchema,
  normalizeStartingEquipmentGrant,
  resolveEquipmentContentId,
  startingEquipmentChoiceSchema,
  startingEquipmentGrantedItemSchema,
} from './starting-equipment'

const DRUID_STARTING_EQUIPMENT = {
  choose: 1,
  options: [
    {
      id: 'standard-equipment',
      label: 'Standard Equipment',
      items: [
        {
          id: 'leather-armor',
          kind: 'grant',
          equipmentSlug: 'leather-armor',
          quantity: 1,
          equipped: true,
        },
        { id: 'shield', kind: 'grant', equipmentSlug: 'shield', quantity: 1, equipped: true },
        { id: 'sickle', kind: 'grant', equipmentSlug: 'sickle', quantity: 1, equipped: true },
        {
          id: 'quarterstaff',
          kind: 'grant',
          equipmentSlug: 'quarterstaff',
          quantity: 1,
          equipped: false,
          modifiers: [{ kind: 'spellcasting_focus', spellcastingGearKind: 'druidic_focus' }],
        },
        { id: 'explorers-pack', kind: 'grant', equipmentSlug: 'explorers-pack', quantity: 1 },
        { id: 'herbalism-kit', kind: 'grant', equipmentSlug: 'herbalism-kit', quantity: 1 },
      ],
      wealth: { gp: 9 },
    },
    {
      id: 'starting-gold',
      label: 'Starting Gold',
      items: [],
      wealth: { gp: 50 },
    },
  ],
}

describe('startingEquipmentGrantedItemSchema', () => {
  it('normalizes legacy equipmentSlug grants to target.source equipment', () => {
    expect(
      startingEquipmentGrantedItemSchema.parse({
        id: 'spear',
        kind: 'grant',
        equipmentSlug: 'spear',
        quantity: 1,
        equipped: true,
      }),
    ).toEqual({
      id: 'spear',
      kind: 'grant',
      target: { source: 'equipment', equipmentSlug: 'spear' },
      quantity: 1,
      equipped: true,
    })
  })

  it('accepts proficiency_choice targets without modifiers', () => {
    expect(
      startingEquipmentGrantedItemSchema.parse({
        id: 'class-tools-tool',
        kind: 'grant',
        target: { source: 'proficiency_choice', choiceId: 'class-tools' },
        quantity: 1,
      }),
    ).toEqual({
      id: 'class-tools-tool',
      kind: 'grant',
      target: { source: 'proficiency_choice', choiceId: 'class-tools' },
      quantity: 1,
    })
  })

  it('rejects modifiers on proficiency_choice grants', () => {
    expect(
      startingEquipmentGrantedItemSchema.safeParse({
        id: 'class-tools-tool',
        kind: 'grant',
        target: { source: 'proficiency_choice', choiceId: 'class-tools' },
        modifiers: [{ kind: 'spellcasting_focus', spellcastingGearKind: 'druidic_focus' }],
      }).success,
    ).toBe(false)
  })

  it('strips legacy equipmentSlug when target is present', () => {
    expect(
      normalizeStartingEquipmentGrant({
        kind: 'grant',
        equipmentSlug: 'spear',
        target: { source: 'proficiency_choice', choiceId: 'class-tools' },
      }),
    ).toEqual({
      kind: 'grant',
      target: { source: 'proficiency_choice', choiceId: 'class-tools' },
    })
  })
})

describe('startingEquipmentChoiceSchema', () => {
  it('accepts campaign availability on options', () => {
    const parsed = startingEquipmentChoiceSchema.parse({
      choose: 1,
      options: [
        {
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [{ id: 'spear', kind: 'grant', equipmentSlug: 'spear', quantity: 1 }],
          available: false,
        },
      ],
    })

    expect(parsed.options[0]?.available).toBe(false)
  })

  it('accepts granted items, modifiers, and wealth on options', () => {
    const parsed = startingEquipmentChoiceSchema.parse(DRUID_STARTING_EQUIPMENT)
    expect(parsed.choose).toBe(1)
    expect(parsed.options).toHaveLength(2)
    expect(parsed.options[0]?.items[0]).toMatchObject({
      kind: 'grant',
      target: { source: 'equipment', equipmentSlug: 'leather-armor' },
      equipped: true,
    })
    expect(parsed.options[0]?.items[3]).toMatchObject({
      kind: 'grant',
      target: { source: 'equipment', equipmentSlug: 'quarterstaff' },
      modifiers: [{ kind: 'spellcasting_focus', spellcastingGearKind: 'druidic_focus' }],
    })
  })

  it('rejects options with no items and no wealth grant', () => {
    expect(
      startingEquipmentChoiceSchema.safeParse({
        choose: 1,
        options: [
          {
            id: 'empty',
            label: 'Empty Package',
            items: [],
          },
        ],
      }).success,
    ).toBe(false)
  })

  it('rejects more than one wealth-only starting-gold option', () => {
    const result = startingEquipmentChoiceSchema.safeParse({
      choose: 1,
      options: [
        {
          id: 'starting-gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 75 },
        },
        {
          id: 'buy-your-own-gear',
          label: 'Buy Your Own Gear',
          items: [],
          wealth: { gp: 50 },
        },
      ],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes('wealth-only'))).toBe(true)
    }
  })

  it('accepts structured item choices filtered by tool category', () => {
    expect(
      startingEquipmentChoiceSchema.parse({
        choose: 1,
        options: [
          {
            id: 'standard-equipment',
            label: 'Standard Equipment',
            items: [
              {
                id: 'musical-instrument-choice',
                kind: 'choice',
                choose: 1,
                pool: {
                  source: 'filtered',
                  equipmentKind: 'tool',
                  toolCategory: 'musical_instrument',
                },
              },
            ],
            wealth: { gp: 19 },
          },
        ],
      }).options[0]?.items[0],
    ).toMatchObject({
      kind: 'choice',
      pool: {
        source: 'filtered',
        equipmentKind: 'tool',
        toolCategory: 'musical_instrument',
      },
    })
  })

  it('requires item choices to declare a pool', () => {
    expect(
      startingEquipmentChoiceSchema.safeParse({
        choose: 1,
        options: [
          {
            id: 'standard-equipment',
            label: 'Standard Equipment',
            items: [
              {
                id: 'empty-choice',
                kind: 'choice',
                choose: 1,
                label: 'Pick one',
                pool: { source: 'explicit', equipmentSlugs: [] },
              },
            ],
          },
        ],
      }).success,
    ).toBe(false)
  })

  it('normalizes legacy item choice pools on parse', () => {
    expect(
      startingEquipmentChoiceSchema.parse({
        choose: 1,
        options: [
          {
            id: 'standard-equipment',
            label: 'Standard Equipment',
            items: [
              {
                id: 'musical-instrument-choice',
                kind: 'choice',
                choose: 1,
                from: { toolCategories: ['musical_instrument'] },
              },
            ],
          },
        ],
      }).options[0]?.items[0],
    ).toMatchObject({
      id: 'musical-instrument-choice',
      kind: 'choice',
      pool: {
        source: 'filtered',
        equipmentKind: 'tool',
        toolCategory: 'musical_instrument',
      },
    })
  })

  it('rejects missing and duplicate contribution ids', () => {
    expect(
      startingEquipmentChoiceSchema.safeParse({
        choose: 1,
        options: [
          {
            id: 'standard-equipment',
            label: 'Standard Equipment',
            items: [{ kind: 'grant', equipmentSlug: 'spear', quantity: 1 }],
          },
        ],
      }).success,
    ).toBe(false)

    const duplicate = startingEquipmentChoiceSchema.safeParse({
      choose: 1,
      options: [
        {
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [
            { id: 'spear', kind: 'grant', equipmentSlug: 'spear', quantity: 1 },
            { id: 'spear', kind: 'grant', equipmentSlug: 'javelin', quantity: 1 },
          ],
        },
      ],
    })
    expect(duplicate.success).toBe(false)
  })

  it('allows two entries to share an equipment slug when their ids differ', () => {
    const parsed = startingEquipmentChoiceSchema.parse({
      choose: 1,
      options: [
        {
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [
            { id: 'dagger', kind: 'grant', equipmentSlug: 'dagger', quantity: 1 },
            { id: 'dagger-2', kind: 'grant', equipmentSlug: 'dagger', quantity: 1 },
          ],
        },
      ],
    })

    expect(parsed.options[0]?.items.map((item) => item.id)).toEqual(['dagger', 'dagger-2'])
  })

  it('rejects starting-equipment choice entries with choose greater than 1', () => {
    expect(
      startingEquipmentChoiceSchema.safeParse({
        choose: 1,
        options: [
          {
            id: 'standard-equipment',
            label: 'Standard Equipment',
            items: [
              {
                id: 'musical-instrument-choice',
                kind: 'choice',
                choose: 2,
                pool: {
                  source: 'filtered',
                  equipmentKind: 'tool',
                  toolCategory: 'musical_instrument',
                },
              },
            ],
          },
        ],
      }).success,
    ).toBe(false)
  })
})

describe('classCharacterCreationSchema', () => {
  it('wraps starting equipment on the class body', () => {
    const parsed = classCharacterCreationSchema.parse({
      startingEquipment: DRUID_STARTING_EQUIPMENT,
      abilityScoreOrder: ['wis', 'con', 'int', 'dex', 'cha', 'str'],
    })

    expect(parsed.startingEquipment?.options[0]?.items[0]).toMatchObject({
      kind: 'grant',
      target: { source: 'equipment', equipmentSlug: 'leather-armor' },
    })
  })

  it('accepts proficiencies-only character creation', () => {
    expect(
      classCharacterCreationSchema.parse({
        proficiencies: {
          skills: {
            choices: [{ id: 'class-skills', choose: 2, from: ['athletics', 'stealth'] }],
          },
        },
        abilityScoreOrder: ['str', 'dex', 'con', 'int', 'wis', 'cha'],
      }),
    ).toMatchObject({
      proficiencies: {
        skills: {
          choices: [{ id: 'class-skills', choose: 2, from: ['athletics', 'stealth'] }],
        },
      },
    })
  })

  it('accepts equipment-recommendations-only character creation', () => {
    expect(
      classCharacterCreationSchema.parse({
        equipmentRecommendations: {
          essential: [
            {
              match: { source: 'explicit', equipmentSlugs: ['spellbook'] },
              label: 'Spellbook',
            },
          ],
          strong: [
            {
              match: {
                source: 'filtered',
                equipmentKind: 'adventuring_gear',
                gearKind: 'spellcasting',
              },
              minLevel: 2,
            },
          ],
        },
        abilityScoreOrder: ['int', 'wis', 'con', 'dex', 'cha', 'str'],
      }),
    ).toMatchObject({
      equipmentRecommendations: {
        essential: [{ label: 'Spellbook' }],
        strong: [{ minLevel: 2 }],
      },
    })
  })

  it('rejects empty character creation', () => {
    expect(classCharacterCreationSchema.safeParse({}).success).toBe(false)
  })
})

describe('resolveEquipmentContentId', () => {
  it('formats ruleset-scoped equipment ids from bare slugs', () => {
    expect(resolveEquipmentContentId('srd-cc-5.2.1', 'longsword')).toBe('srd-cc-5.2.1:longsword')
  })
})
