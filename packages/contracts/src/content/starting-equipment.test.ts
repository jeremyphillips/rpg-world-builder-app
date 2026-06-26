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
        { kind: 'fixed', equipmentSlug: 'leather-armor', quantity: 1, equipped: true },
        { kind: 'fixed', equipmentSlug: 'shield', quantity: 1, equipped: true },
        { kind: 'fixed', equipmentSlug: 'sickle', quantity: 1, equipped: true },
        {
          kind: 'fixed',
          equipmentSlug: 'quarterstaff',
          quantity: 1,
          equipped: false,
          modifiers: [{ kind: 'spellcasting_focus', focusKind: 'druidic_focus' }],
        },
        { kind: 'fixed', equipmentSlug: 'explorers-pack', quantity: 1 },
        { kind: 'fixed', equipmentSlug: 'herbalism-kit', quantity: 1 },
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
  it('accepts fixed items, modifiers, and wealth on options', () => {
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
                label: 'Musical Instrument',
                from: { toolCategories: ['musical_instrument'] },
              },
            ],
            wealth: { gp: 19 },
          },
        ],
      }).options[0]?.items[0],
    ).toMatchObject({
      kind: 'choice',
      from: { toolCategories: ['musical_instrument'] },
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
            items: [{ kind: 'choice', choose: 1, label: 'Pick one', from: {} }],
          },
        ],
      }).success,
    ).toBe(false)
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
})

describe('resolveEquipmentContentId', () => {
  it('formats ruleset-scoped equipment ids from bare slugs', () => {
    expect(resolveEquipmentContentId('srd-cc-5.2.1', 'longsword')).toBe('srd-cc-5.2.1:longsword')
  })
})
