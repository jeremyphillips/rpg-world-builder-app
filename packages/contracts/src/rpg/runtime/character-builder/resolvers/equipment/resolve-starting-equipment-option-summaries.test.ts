import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'
import type { ClassStored } from '../../../../content/classes/class'
import { indexCharacterBuildCatalog } from '../../context'
import {
  resolveStartingEquipmentOptionSummaries,
  STARTING_EQUIPMENT_MISSING_ITEM_MESSAGE,
  STARTING_EQUIPMENT_UNAVAILABLE_POOL_MESSAGE,
} from './resolve-starting-equipment-option-summaries'

const RULESET = 'srd-cc-5.2.1' as const

const leatherArmor = equipmentSchema.parse({
  id: `${RULESET}:leather-armor`,
  slug: 'leather-armor',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Leather Armor',
  description: '',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 10, unit: 'lb' },
  kind: 'armor',
  category: 'light',
  baseAc: 11,
  addDexModifier: true,
  stealthDisadvantage: false,
})

const lute = equipmentSchema.parse({
  id: `${RULESET}:lute`,
  slug: 'lute',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Lute',
  description: '',
  cost: { amount: 35, currency: 'gp' },
  weight: { value: 2, unit: 'lb' },
  kind: 'tool',
  toolCategory: 'musical_instrument',
  ability: 'cha',
  utilizes: [{ description: 'Play a known tune', dc: 10 }],
})

const storedBard: ClassStored = {
  id: `${RULESET}:bard`,
  slug: 'bard',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Bard',
  primaryAbilities: ['cha'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['dex', 'cha'],
    armor: { categories: ['light'], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard-equipment',
          label: 'Standard Equipment',
          items: [
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'leather-armor' },
              quantity: 1,
              equipped: true,
            },
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
        {
          id: 'broken',
          label: 'Broken Package',
          items: [
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'missing-cloak' },
              quantity: 1,
            },
          ],
        },
        {
          id: 'empty-pool',
          label: 'Empty Pool Package',
          items: [
            {
              kind: 'choice',
              choose: 1,
              pool: {
                source: 'filtered',
                equipmentKind: 'tool',
                toolCategory: 'gaming_set',
              },
            },
          ],
        },
      ],
    },
  },
}

describe('resolveStartingEquipmentOptionSummaries', () => {
  it('groups resolved grants by inventory bucket and keeps selectable packages enabled', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedBard],
      spells: [],
      equipment: [leatherArmor, lute],
      skillProficiencies: [],
      languages: [],
    })

    const summaries = resolveStartingEquipmentOptionSummaries(storedBard, catalogIndex)
    const standard = summaries.find((summary) => summary.optionId === 'standard-equipment')!

    expect(standard.isSelectable).toBe(true)
    expect(standard.wealth).toEqual({ gp: 19 })
    expect(standard.description).toBe('Leather Armor, 1× Musical Instrument, and 19 GP.')
    expect(standard.orderedItems).toHaveLength(2)
    expect(standard.itemsByGroup.armor).toHaveLength(1)
    expect(standard.itemsByGroup.tools).toHaveLength(1)
    expect(standard.itemsByGroup.armor[0]).toMatchObject({
      kind: 'grant',
      equipmentSlug: 'leather-armor',
      quantity: 1,
    })
    expect(standard.itemsByGroup.tools[0]).toMatchObject({
      kind: 'choice',
      poolLabel: 'Musical Instrument',
    })
  })

  it('disables packages only for missing grants or empty pools', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [storedBard],
      spells: [],
      equipment: [leatherArmor, lute],
      skillProficiencies: [],
      languages: [],
    })

    const summaries = resolveStartingEquipmentOptionSummaries(storedBard, catalogIndex)
    const broken = summaries.find((summary) => summary.optionId === 'broken')!
    const emptyPool = summaries.find((summary) => summary.optionId === 'empty-pool')!

    expect(broken.isSelectable).toBe(false)
    expect(broken.missingItemSlugs).toEqual(['missing-cloak'])
    expect(broken.unselectableReasons[0]).toContain(STARTING_EQUIPMENT_MISSING_ITEM_MESSAGE)

    expect(emptyPool.isSelectable).toBe(false)
    expect(emptyPool.unselectableReasons[0]).toContain(STARTING_EQUIPMENT_UNAVAILABLE_POOL_MESSAGE)
  })
})
