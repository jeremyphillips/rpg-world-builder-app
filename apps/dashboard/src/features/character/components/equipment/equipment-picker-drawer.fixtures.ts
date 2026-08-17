import type { Equipment } from '@rpg/contracts'

import { makeEquipment } from '@/test/fixtures/factories/equipment'
import { pickEquipment } from '@/test/fixtures/pick'

import { assembleEquipmentPickerSearchDocument } from '../../lib/equipment/equipment-picker-search.lib'

import type { EquipmentBudgetSummary, EquipmentPickerItem } from './equipment-picker-drawer.types'

export const equipmentPickerLongswordFixture = pickEquipment('longsword')

export const equipmentPickerChainMailFixture = pickEquipment('chain-mail')

export const equipmentPickerRopeFixture = pickEquipment('rope')

export const equipmentPickerArrowsFixture = pickEquipment('arrows')

export const equipmentPickerRowboatFixture = pickEquipment('rowboat')

export const equipmentPickerSkilledHirelingFixture = pickEquipment('skilled-hireling')

export const equipmentPickerBudgetFixture: EquipmentBudgetSummary = {
  starting: { cp: 0, sp: 0, gp: 100, pp: 0 },
  spent: { cp: 0, sp: 0, gp: 15, pp: 0 },
  remaining: { cp: 0, sp: 0, gp: 40, pp: 0 },
}

export const equipmentPickerLowRemainingBudgetFixture: EquipmentBudgetSummary = {
  starting: { cp: 0, sp: 0, gp: 100, pp: 0 },
  spent: { cp: 0, sp: 0, gp: 95, pp: 0 },
  remaining: { cp: 0, sp: 0, gp: 5, pp: 0 },
}

export const equipmentPickerCheapGearFixture = makeEquipment({
  kind: 'adventuring_gear',
  slug: 'cheap-gear',
  name: 'Cheap Gear',
  gearKind: 'consumable',
  cost: { amount: 2, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  description: '<p>Inexpensive adventuring gear.</p>',
})

export const equipmentPickerMidGearFixture = makeEquipment({
  kind: 'adventuring_gear',
  slug: 'mid-gear',
  name: 'Mid Gear',
  gearKind: 'consumable',
  cost: { amount: 25, currency: 'gp' },
  weight: { value: 2, unit: 'lb' },
  description: '<p>Mid-priced adventuring gear.</p>',
})

export const equipmentPickerExpensiveGearFixture = makeEquipment({
  kind: 'adventuring_gear',
  slug: 'expensive-gear',
  name: 'Expensive Gear',
  gearKind: 'consumable',
  cost: { amount: 150, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
  description: '<p>Expensive adventuring gear.</p>',
})

export const equipmentPickerPotionFixture = pickEquipment('potion-of-healing')

const purchaseAvailabilityAvailable = { status: 'available' as const }
const purchaseAvailabilityUnaffordable = { status: 'unaffordable' as const, shortfallCp: 1 }

export function pickerState(
  state: Omit<EquipmentPickerItem['state'], 'purchaseAvailability'> & {
    purchaseAvailability?: EquipmentPickerItem['state']['purchaseAvailability']
  },
): EquipmentPickerItem['state'] {
  return {
    ...state,
    purchaseAvailability: state.purchaseAvailability ?? purchaseAvailabilityAvailable,
  }
}

export function equipmentPickerItemFixture(args: {
  equipment: Equipment
  state: Parameters<typeof pickerState>[0]
  searchText?: string
}): EquipmentPickerItem {
  return {
    equipment: args.equipment,
    searchDocument: args.searchText
      ? {
          id: args.equipment.id,
          fields: [{ key: 'combined', text: args.searchText, role: 'primary' }],
        }
      : assembleEquipmentPickerSearchDocument(args.equipment),
    state: pickerState(args.state),
  }
}

export const equipmentPickerDefaultPathItemsFixture: EquipmentPickerItem[] = [
  equipmentPickerItemFixture({
    equipment: equipmentPickerCheapGearFixture,
    searchText: 'cheap gear adventuring gear',
    state: {
      isAvailable: true,
      isRecommended: false,
      isProficient: true,
      isAffordable: true,
      isWithinRemainingBudget: true,
      recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
      disabledReasons: [],
    },
  }),
  equipmentPickerItemFixture({
    equipment: equipmentPickerMidGearFixture,
    searchText: 'mid gear adventuring gear',
    state: {
      isAvailable: true,
      isRecommended: false,
      isProficient: true,
      isAffordable: true,
      isWithinRemainingBudget: false,
      purchaseAvailability: purchaseAvailabilityUnaffordable,
      recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
      disabledReasons: [],
    },
  }),
  equipmentPickerItemFixture({
    equipment: equipmentPickerExpensiveGearFixture,
    searchText: 'expensive gear adventuring gear',
    state: {
      isAvailable: true,
      isRecommended: false,
      isProficient: true,
      isAffordable: false,
      isWithinRemainingBudget: false,
      purchaseAvailability: purchaseAvailabilityUnaffordable,
      recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
      disabledReasons: [],
    },
  }),
]

export const equipmentPickerItemsFixture: EquipmentPickerItem[] = [
  equipmentPickerItemFixture({
    equipment: equipmentPickerLongswordFixture,
    searchText: 'longsword martial melee',
    state: {
      isAvailable: true,
      isRecommended: true,
      isProficient: true,
      isAffordable: true,
      isWithinRemainingBudget: true,
      recommendation: {
        tier: 'strong',
        reasons: ['startingEquipment', 'proficient'],
        specificity: 'exact',
      },
      disabledReasons: [],
    },
  }),
  equipmentPickerItemFixture({
    equipment: equipmentPickerChainMailFixture,
    searchText: 'chain mail heavy armor',
    state: {
      isAvailable: true,
      isRecommended: false,
      isProficient: false,
      isAffordable: true,
      isWithinRemainingBudget: false,
      purchaseAvailability: purchaseAvailabilityUnaffordable,
      recommendation: { tier: 'notRecommended', reasons: ['notProficient'], specificity: 'exact' },
      disabledReasons: [],
    },
  }),
  equipmentPickerItemFixture({
    equipment: equipmentPickerRopeFixture,
    searchText: 'rope adventuring gear',
    state: {
      isAvailable: true,
      isRecommended: false,
      isProficient: true,
      isAffordable: true,
      isWithinRemainingBudget: true,
      recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
      disabledReasons: [],
    },
  }),
]

export const equipmentPickerMagicItemsFixture: EquipmentPickerItem[] = [
  equipmentPickerItemFixture({
    equipment: equipmentPickerPotionFixture,
    searchText: 'potion of healing magic item',
    state: {
      isAvailable: true,
      isRecommended: false,
      isProficient: true,
      isAffordable: true,
      isWithinRemainingBudget: true,
      recommendation: { tier: 'neutral', reasons: [], specificity: 'broad_pool' },
      disabledReasons: [],
    },
  }),
]

export const equipmentPickerMagicItemProgressFixture = [
  {
    allowanceId: 'startingWealthTier:srd-cc-5.2.1-standard:hero:common',
    rarity: 'common' as const,
    capacity: 2,
    selected: 0,
    remainingCapacity: 2,
    isFilled: false,
  },
  {
    allowanceId: 'startingWealthTier:srd-cc-5.2.1-standard:hero:uncommon',
    rarity: 'uncommon' as const,
    capacity: 1,
    selected: 0,
    remainingCapacity: 1,
    isFilled: false,
  },
]
