import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'
import {
  EQUIPMENT_PURCHASE_QUANTITY_MAX,
  formatEquipmentInventoryPriceLine,
  formatEquipmentPurchaseTotalPriceLabel,
  formatEquipmentPurchaseUnitPriceLabel,
  formatEquipmentBundleLabel,
  resolveEquipmentAcquisitionMaxQuantity,
  resolveEquipmentPurchaseQuantityLimits,
} from './resolve-equipment-purchase-quantity-limits'

const RULESET = 'srd-cc-5.2.1' as const

const rations = equipmentSchema.parse({
  id: `${RULESET}:rations`,
  slug: 'rations',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Rations',
  description: '',
  kind: 'adventuring_gear',
  gearKind: 'consumable',
  cost: { amount: 5, currency: 'sp' },
  weight: { value: 2, unit: 'lb' },
})

const longsword = equipmentSchema.parse({
  id: `${RULESET}:longsword`,
  slug: 'longsword',
  rulesetId: RULESET,
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Longsword',
  description: '',
  kind: 'weapon',
  category: 'martial',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 8 } },
  damageType: 'slashing',
  properties: [],
  mastery: 'sap',
  cost: { amount: 15, currency: 'gp' },
  weight: { value: 3, unit: 'lb' },
})

const budget = {
  starting: { cp: 0, sp: 0, gp: 10, pp: 0 },
  spent: { cp: 0, sp: 0, gp: 4, pp: 0 },
  remaining: { cp: 0, sp: 0, gp: 6, pp: 0 },
}

describe('resolveEquipmentAcquisitionMaxQuantity', () => {
  it('caps starting-gold acquisition at 99 and respects remaining budget', () => {
    expect(
      resolveEquipmentAcquisitionMaxQuantity({
        equipment: longsword,
        budget,
        currentQuantity: 0,
      }),
    ).toBe(1)

    const surplusBudget = {
      starting: { cp: 0, sp: 0, gp: 100, pp: 0 },
      spent: { cp: 0, sp: 0, gp: 60, pp: 0 },
      remaining: { cp: 0, sp: 0, gp: 40, pp: 0 },
    }

    expect(
      resolveEquipmentAcquisitionMaxQuantity({
        equipment: longsword,
        budget: surplusBudget,
        currentQuantity: 0,
      }),
    ).toBe(2)

    expect(
      resolveEquipmentAcquisitionMaxQuantity({
        equipment: rations,
        budget,
        currentQuantity: 0,
      }),
    ).toBe(12)

    expect(
      resolveEquipmentAcquisitionMaxQuantity({
        equipment: rations,
        currentQuantity: 0,
      }),
    ).toBe(EQUIPMENT_PURCHASE_QUANTITY_MAX)
  })
})

describe('resolveEquipmentPurchaseQuantityLimits', () => {
  it('allows editing starting-gold stackable purchases within budget and cap', () => {
    expect(
      resolveEquipmentPurchaseQuantityLimits({
        equipment: rations,
        sourceMode: 'startingGold',
        budget,
        currentQuantity: 2,
        isPurchaseRow: true,
      }),
    ).toEqual({
      editable: true,
      min: 1,
      max: 14,
      showCost: true,
    })
  })

  it('treats converted package purchases as editable while stack rules are permissive', () => {
    expect(
      resolveEquipmentPurchaseQuantityLimits({
        equipment: longsword,
        sourceMode: 'startingGold',
        origin: 'packageConversion',
        budget,
        currentQuantity: 5,
        isPurchaseRow: true,
      }),
    ).toEqual({
      editable: true,
      min: 1,
      max: 5,
      showCost: true,
    })
  })

  it('locks manual purchase rows', () => {
    expect(
      resolveEquipmentPurchaseQuantityLimits({
        equipment: longsword,
        sourceMode: 'manual',
        budget,
        currentQuantity: 1,
        isPurchaseRow: true,
      }),
    ).toEqual({
      editable: false,
      min: 1,
      max: 1,
      showCost: false,
    })

    expect(
      resolveEquipmentPurchaseQuantityLimits({
        equipment: rations,
        sourceMode: 'manual',
        budget,
        currentQuantity: 3,
        isPurchaseRow: true,
      }),
    ).toEqual({
      editable: false,
      min: 1,
      max: 3,
      showCost: false,
    })
  })

  it('locks package grant rows', () => {
    expect(
      resolveEquipmentPurchaseQuantityLimits({
        equipment: longsword,
        currentQuantity: 1,
        isPurchaseRow: false,
      }),
    ).toEqual({
      editable: false,
      min: 1,
      max: 1,
      showCost: false,
    })
  })

  it('uses the hard cap when no spendable budget applies', () => {
    const zeroBudget = {
      starting: { cp: 0, sp: 0, gp: 0, pp: 0 },
      spent: { cp: 0, sp: 0, gp: 0, pp: 0 },
      remaining: { cp: 0, sp: 0, gp: 0, pp: 0 },
    }

    expect(
      resolveEquipmentPurchaseQuantityLimits({
        equipment: rations,
        sourceMode: 'startingGold',
        budget: zeroBudget,
        currentQuantity: 0,
        isPurchaseRow: true,
      }).max,
    ).toBe(EQUIPMENT_PURCHASE_QUANTITY_MAX)
  })
})

describe('equipment purchase price labels', () => {
  it('formats unit and normalized total prices', () => {
    expect(formatEquipmentPurchaseUnitPriceLabel(longsword)).toBe('15 GP each')
    expect(formatEquipmentPurchaseTotalPriceLabel(longsword, 2)).toBe('30 GP')
    expect(formatEquipmentPurchaseTotalPriceLabel(rations, 2)).toBe('1 GP')
  })

  it('returns empty price labels for unpriced equipment', () => {
    const unpriced = equipmentSchema.parse({
      ...longsword,
      id: `${RULESET}:token`,
      slug: 'token',
      name: 'Token',
      cost: null,
    })

    expect(formatEquipmentPurchaseUnitPriceLabel(unpriced)).toBe('')
    expect(formatEquipmentPurchaseTotalPriceLabel(unpriced, 2)).toBe('')
    expect(
      formatEquipmentInventoryPriceLine({
        equipment: unpriced,
        quantity: 2,
        priceContext: 'startingGold',
      }),
    ).toBe('')
  })

  it('formats inventory price lines for stackable, bundle, and non-stackable rows', () => {
    expect(
      formatEquipmentInventoryPriceLine({
        equipment: longsword,
        quantity: 1,
        priceContext: 'startingGold',
      }),
    ).toBe('15 GP')
    expect(
      formatEquipmentInventoryPriceLine({
        equipment: longsword,
        quantity: 2,
        priceContext: 'startingGold',
      }),
    ).toBe('15 GP each · 30 GP total')
    expect(
      formatEquipmentInventoryPriceLine({
        equipment: longsword,
        quantity: 1,
        priceContext: 'package',
      }),
    ).toBe('15 GP value')
    expect(
      formatEquipmentInventoryPriceLine({
        equipment: longsword,
        quantity: 2,
        priceContext: 'package',
      }),
    ).toBe('15 GP value · 30 GP total value')
    expect(
      formatEquipmentInventoryPriceLine({
        equipment: rations,
        quantity: 1,
        priceContext: 'startingGold',
      }),
    ).toBe('5 SP')
    expect(
      formatEquipmentInventoryPriceLine({
        equipment: rations,
        quantity: 2,
        priceContext: 'startingGold',
      }),
    ).toBe('5 SP each · 1 GP total')

    const arrows = equipmentSchema.parse({
      ...rations,
      id: `${RULESET}:arrows`,
      slug: 'arrows',
      name: 'Arrows',
      gearKind: 'ammunition',
      bundleSize: 20,
      cost: { amount: 1, currency: 'gp' },
    })

    expect(
      formatEquipmentInventoryPriceLine({
        equipment: arrows,
        quantity: 1,
        priceContext: 'startingGold',
      }),
    ).toBe('1 GP per bundle · 20 arrows per bundle')
    expect(
      formatEquipmentInventoryPriceLine({
        equipment: arrows,
        quantity: 2,
        priceContext: 'startingGold',
      }),
    ).toBe('1 GP per bundle · 2 GP total · 20 arrows per bundle')
  })
})

describe('formatEquipmentBundleLabel', () => {
  it('formats bundle copy for bundled adventuring gear', () => {
    expect(formatEquipmentBundleLabel(rations)).toBeUndefined()

    const arrows = equipmentSchema.parse({
      ...rations,
      id: `${RULESET}:arrows`,
      slug: 'arrows',
      name: 'Arrows',
      gearKind: 'ammunition',
      bundleSize: 20,
      cost: { amount: 1, currency: 'gp' },
    })

    expect(formatEquipmentBundleLabel(arrows)).toBe('20 arrows per bundle')
  })
})
