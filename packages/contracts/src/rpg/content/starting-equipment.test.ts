import { describe, expect, it } from 'vitest'

import {
  classCharacterCreationSchema,
  resolveEquipmentContentId,
  startingEquipmentChoiceSchema,
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
          modifiers: [{ kind: 'spellcasting_focus', focusKind: 'druidic_focus' }],
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

describe('startingEquipmentChoiceSchema', () => {
  it('accepts granted items, modifiers, and wealth on options', () => {
    expect(startingEquipmentChoiceSchema.parse(DRUID_STARTING_EQUIPMENT)).toEqual(
      DRUID_STARTING_EQUIPMENT,
    )
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
    expect(
      classCharacterCreationSchema.parse({
        startingEquipment: DRUID_STARTING_EQUIPMENT,
      }),
    ).toEqual({
      startingEquipment: DRUID_STARTING_EQUIPMENT,
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
})

describe('resolveEquipmentContentId', () => {
  it('formats ruleset-scoped equipment ids from bare slugs', () => {
    expect(resolveEquipmentContentId('srd-cc-5.2.1', 'longsword')).toBe('srd-cc-5.2.1:longsword')
  })
})
