import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'
import type { ClassStored } from '../../../../content/classes/class'
import { createEmptyCharacterBuilderDraft } from '../../draft'
import { indexCharacterBuildCatalog } from '../../context'
import { startingEquipmentChoiceSetId } from './resolve-starting-equipment-choice-sets'
import {
  deriveEquipmentDraftEntries,
  startingEquipmentPackageItemKey,
} from './derive-equipment-draft-entries'

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

const rope = equipmentSchema.parse({
  id: `${RULESET}:rope`,
  slug: 'rope',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Rope',
  description: '',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 5, unit: 'lb' },
  kind: 'adventuring_gear',
  gearKind: 'general',
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
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'leather-armor' },
              quantity: 1,
              equipped: true,
            },
            {
              kind: 'grant',
              target: { source: 'equipment', equipmentSlug: 'shield' },
              quantity: 1,
              equipped: true,
            },
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

function makeCatalogIndex() {
  return indexCharacterBuildCatalog({
    species: [],
    classes: [storedDruid],
    spells: [],
    equipment: [leatherArmor, shield, rope],
    skillProficiencies: [],
    languages: [],
  })
}

describe('startingEquipmentPackageItemKey', () => {
  it('uses classId, optionId, and item index', () => {
    expect(startingEquipmentPackageItemKey(storedDruid.id, 'standard', 1)).toBe(
      `${storedDruid.id}:standard:1`,
    )
  })
})

describe('deriveEquipmentDraftEntries', () => {
  it('includes package grants with classStartingEquipment sources', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedDruid.id)]: ['standard'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
      },
    }

    const equipment = deriveEquipmentDraftEntries(draft, makeCatalogIndex())

    expect(equipment.armor).toEqual([
      {
        equipmentId: leatherArmor.id,
        quantity: 1,
        equipped: true,
        sources: [
          {
            kind: 'classStartingEquipment',
            sourceId: storedDruid.id,
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
            sourceId: storedDruid.id,
            grantId: 'standard',
          },
        ],
      },
    ])
  })

  it('omits removed package slots by item key', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedDruid.id)]: ['standard'],
      },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [startingEquipmentPackageItemKey(storedDruid.id, 'standard', 0)],
        customized: true,
      },
    }

    const equipment = deriveEquipmentDraftEntries(draft, makeCatalogIndex())

    expect(equipment.armor).toEqual([
      {
        equipmentId: shield.id,
        quantity: 1,
        equipped: true,
        sources: [
          {
            kind: 'classStartingEquipment',
            sourceId: storedDruid.id,
            grantId: 'standard',
          },
        ],
      },
    ])
  })

  it('preserves purchase quantities in derived equipment entries', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedDruid.id, level: 1 as const },
      choiceSelections: {
        [startingEquipmentChoiceSetId(storedDruid.id)]: ['gold'],
      },
      equipment: {
        mode: 'gold' as const,
        purchases: [
          {
            equipmentId: rope.id,
            quantity: 4,
            sourceMode: 'startingGold' as const,
            origin: 'picker' as const,
          },
          {
            equipmentId: shield.id,
            quantity: 1,
            sourceMode: 'manual' as const,
            origin: 'picker' as const,
          },
        ],
        removedPackageItemKeys: [],
        customized: true,
      },
    }

    const equipment = deriveEquipmentDraftEntries(draft, makeCatalogIndex())

    expect(equipment.gear).toEqual([
      {
        equipmentId: rope.id,
        quantity: 4,
        sources: [{ kind: 'startingGold', sourceId: storedDruid.id, grantId: 'gold' }],
      },
    ])
    expect(equipment.armor).toEqual([
      {
        equipmentId: shield.id,
        quantity: 1,
        sources: [{ kind: 'manual' }],
      },
    ])
  })
})
