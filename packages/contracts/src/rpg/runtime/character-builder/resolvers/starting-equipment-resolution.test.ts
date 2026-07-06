import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../content/equipment'
import type { ClassStored } from '../../../content/classes/class'
import { createEmptyCharacterBuilderDraft } from '../draft'
import { indexCharacterBuildCatalog } from '../context'
import {
  assembleStartingEquipment,
  startingEquipmentChoiceSetId,
} from './starting-equipment-resolution'

const RULESET = 'srd-cc-5.2.1' as const

const leatherArmor = equipmentSchema.parse({
  id: `${RULESET}:leather-armor`,
  slug: 'leather-armor',
  rulesetId: RULESET,
  source: 'system',
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

const shield = equipmentSchema.parse({
  id: `${RULESET}:shield`,
  slug: 'shield',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Shield',
  description: '',
  cost: { amount: 10, currency: 'gp' },
  weight: { value: 6, unit: 'lb' },
  kind: 'armor',
  category: 'shields',
  acBonus: 2,
  addDexModifier: false,
  stealthDisadvantage: false,
})

const storedDruid: ClassStored = {
  id: `${RULESET}:druid`,
  slug: 'druid',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Druid',
  primaryAbilities: ['wis'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['int', 'wis'],
    armor: { categories: ['light', 'shields'], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [],
  characterCreation: {
    startingEquipment: {
      choose: 1,
      options: [
        {
          id: 'standard',
          label: 'Standard Equipment',
          items: [
            { kind: 'grant', equipmentSlug: 'leather-armor', quantity: 1, equipped: true },
            { kind: 'grant', equipmentSlug: 'shield', quantity: 1, equipped: true },
          ],
          wealth: { gp: 9 },
        },
        {
          id: 'gold',
          label: 'Starting Gold',
          items: [],
          wealth: { gp: 50 },
        },
      ],
    },
  },
}

const druidClass = storedDruid

describe('assembleStartingEquipment', () => {
  it('assembles equipped armor entries and wealth from the selected package', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [druidClass],
      spells: [],
      equipment: [leatherArmor, shield],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: druidClass.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(druidClass.id)]: ['standard'],
      },
    }

    const { equipment, wealth } = assembleStartingEquipment(draft, catalogIndex)

    expect(wealth).toEqual({ cp: 0, sp: 0, gp: 9, pp: 0 })
    expect(equipment.armor).toEqual([
      {
        equipmentId: leatherArmor.id,
        quantity: 1,
        equipped: true,
        sources: [
          {
            kind: 'classStartingEquipment',
            sourceId: druidClass.id,
            grantId: 'standard',
          },
        ],
      },
      {
        equipmentId: shield.id,
        quantity: 1,
        equipped: true,
        sources: [
          {
            kind: 'classStartingEquipment',
            sourceId: druidClass.id,
            grantId: 'standard',
          },
        ],
      },
    ])
  })

  it('returns only wealth for a gold package selection', () => {
    const catalogIndex = indexCharacterBuildCatalog({
      species: [],
      classes: [druidClass],
      spells: [],
      equipment: [leatherArmor, shield],
      skillProficiencies: [],
      languages: [],
    })

    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: druidClass.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(druidClass.id)]: ['gold'],
      },
    }

    const { equipment, wealth } = assembleStartingEquipment(draft, catalogIndex)

    expect(wealth).toEqual({ cp: 0, sp: 0, gp: 50, pp: 0 })
    expect(equipment).toEqual({
      weapons: [],
      armor: [],
      tools: [],
      gear: [],
      magicItems: [],
      vehicles: [],
      mounts: [],
    })
  })
})
