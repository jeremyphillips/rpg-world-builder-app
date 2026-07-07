import { DEFAULT_SYSTEM_RULESET_ID, type Equipment } from '@rpg/contracts'

import type { EquipmentBudgetSummary, EquipmentPickerItem } from './equipment-picker-drawer.types'

export const equipmentPickerLongswordFixture = {
  id: 'srd-cc-5.2.1:longsword',
  slug: 'longsword',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Longsword',
  kind: 'weapon',
  category: 'martial',
  mode: 'melee',
  damage: { kind: 'dice', count: 1, faces: 8 },
  damageType: 'slashing',
  properties: ['versatile'],
  versatileDamage: { kind: 'dice', count: 1, faces: 10 },
  mastery: 'sap',
  cost: { amount: 15, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  description: '<p>A martial melee weapon.</p>',
} as const satisfies Equipment

export const equipmentPickerChainMailFixture = {
  id: 'srd-cc-5.2.1:chain-mail',
  slug: 'chain-mail',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Chain Mail',
  kind: 'armor',
  category: 'heavy',
  addDexModifier: false,
  baseAc: 16,
  stealthDisadvantage: true,
  strengthRequirement: 13,
  cost: { amount: 75, currency: 'gp' },
  weight: { value: 55, unit: 'lb' },
  description: '<p>Heavy armor made of interlocking metal rings.</p>',
} as const satisfies Equipment

export const equipmentPickerRopeFixture = {
  id: 'srd-cc-5.2.1:rope',
  slug: 'rope',
  rulesetId: DEFAULT_SYSTEM_RULESET_ID,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Rope',
  kind: 'adventuring_gear',
  gearKind: 'general',
  cost: { amount: 1, currency: 'gp' },
  weight: { value: 5, unit: 'lb' },
  description: '<p>Hempen rope, 50 feet.</p>',
} as const satisfies Equipment

export const equipmentPickerBudgetFixture: EquipmentBudgetSummary = {
  starting: { cp: 0, sp: 0, gp: 100, pp: 0 },
  spent: { cp: 0, sp: 0, gp: 15, pp: 0 },
  remaining: { cp: 0, sp: 0, gp: 40, pp: 0 },
}

export const equipmentPickerItemsFixture: EquipmentPickerItem[] = [
  {
    equipment: equipmentPickerLongswordFixture,
    searchText: 'longsword martial melee',
    state: {
      isAvailable: true,
      isRecommended: true,
      isProficient: true,
      isAffordable: true,
      disabledReasons: [],
    },
  },
  {
    equipment: equipmentPickerChainMailFixture,
    searchText: 'chain mail heavy armor',
    state: {
      isAvailable: true,
      isRecommended: false,
      isProficient: false,
      isAffordable: false,
      disabledReasons: [],
    },
  },
  {
    equipment: equipmentPickerRopeFixture,
    searchText: 'rope adventuring gear',
    state: {
      isAvailable: true,
      isRecommended: true,
      isProficient: true,
      isAffordable: true,
      disabledReasons: [],
    },
  },
]
