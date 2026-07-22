import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../../../../content/equipment'
import { resolveEquipmentPurchasePricing } from './resolve-equipment-purchase-pricing'

const RULESET = 'srd-cc-5.2.1' as const

const pricedWeapon = equipmentSchema.parse({
  id: `${RULESET}:dagger`,
  slug: 'dagger',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Dagger',
  description: '',
  cost: { amount: 2, currency: 'gp' },
  weight: { value: 1, unit: 'lb' },
  kind: 'weapon',
  category: 'simple',
  mode: 'melee',
  damage: { dice: { count: 1, faces: 4 } },
  damageType: 'piercing',
  properties: [],
  mastery: 'nick',
})

const unpricedItem = equipmentSchema.parse({
  ...pricedWeapon,
  id: `${RULESET}:token`,
  slug: 'token',
  name: 'Token',
  cost: null,
})

const serviceItem = equipmentSchema.parse({
  id: `${RULESET}:passage`,
  slug: 'passage',
  rulesetId: RULESET,
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Passage',
  description: '',
  cost: { amount: 5, currency: 'sp' },
  kind: 'service',
  serviceCategory: 'transport',
})

describe('resolveEquipmentPurchasePricing', () => {
  it('returns priced status with copper unit cost', () => {
    expect(resolveEquipmentPurchasePricing(pricedWeapon)).toEqual({
      status: 'priced',
      unitCostCp: 200,
    })
  })

  it('returns no_market_price for null cost', () => {
    expect(resolveEquipmentPurchasePricing(unpricedItem)).toEqual({
      status: 'unavailable',
      reason: 'no_market_price',
    })
  })

  it('returns unsupported_kind for non-purchasable kinds', () => {
    expect(resolveEquipmentPurchasePricing(serviceItem)).toEqual({
      status: 'unavailable',
      reason: 'unsupported_kind',
    })
  })
})
