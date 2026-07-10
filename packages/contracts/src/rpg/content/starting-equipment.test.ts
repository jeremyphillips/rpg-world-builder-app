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
      id: 'standard',
      label: 'Standard Equipment',
      description:
        "Leather Armor, Shield, Sickle, Druidic Focus, Explorer's Pack, Herbalism Kit, and 9 GP.",
      items: [
        { kind: 'grant', equipmentSlug: 'leather-armor', quantity: 1, equipped: true },
        { kind: 'grant', equipmentSlug: 'shield', quantity: 1, equipped: true },
        { kind: 'grant', equipmentSlug: 'sickle', quantity: 1, equipped: true },
        {
          kind: 'grant',
          equipmentSlug: 'quarterstaff',
          quantity: 1,
          equipped: false,
          modifiers: [{ kind: 'spellcasting_focus', spellcastingGearKind: 'druidic_focus' }],
        },
        { kind: 'grant', equipmentSlug: 'explorers-pack', quantity: 1 },
        { kind: 'grant', equipmentSlug: 'herbalism-kit', quantity: 1 },
      ],
      wealth: { gp: 9 },
    },
    {
      id: 'gold',
      label: 'Starting Gold',
      description: 'Take 50 GP instead of standard equipment.',
      items: [],
      wealth: { gp: 50 },
    },
  ],
}

describe('startingEquipmentGrantedItemSchema', () => {
  it('normalizes legacy equipmentSlug grants to target.source equipment', () => {
    expect(
      startingEquipmentGrantedItemSchema.parse({
        kind: 'grant',
        equipmentSlug: 'spear',
        quantity: 1,
        equipped: true,
      }),
    ).toEqual({
      kind: 'grant',
      target: { source: 'equipment', equipmentSlug: 'spear' },
      quantity: 1,
      equipped: true,
    })
  })

  it('accepts proficiency_choice targets without modifiers', () => {
    expect(
      startingEquipmentGrantedItemSchema.parse({
        kind: 'grant',
        target: { source: 'proficiency_choice', choiceId: 'class-tools' },
        quantity: 1,
      }),
    ).toEqual({
      kind: 'grant',
      target: { source: 'proficiency_choice', choiceId: 'class-tools' },
      quantity: 1,
    })
  })

  it('rejects modifiers on proficiency_choice grants', () => {
    expect(
      startingEquipmentGrantedItemSchema.safeParse({
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

  it('accepts structured item choices filtered by tool category', () => {
    expect(
      startingEquipmentChoiceSchema.parse({
        choose: 1,
        options: [
          {
            id: 'standard',
            label: 'Standard Equipment',
            items: [
              {
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
            id: 'standard',
            label: 'Standard Equipment',
            items: [
              {
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
            id: 'standard',
            label: 'Standard Equipment',
            items: [
              {
                kind: 'choice',
                choose: 1,
                from: { toolCategories: ['musical_instrument'] },
              },
            ],
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
})

describe('classCharacterCreationSchema', () => {
  it('wraps starting equipment on the class body', () => {
    const parsed = classCharacterCreationSchema.parse({
      startingEquipment: DRUID_STARTING_EQUIPMENT,
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
