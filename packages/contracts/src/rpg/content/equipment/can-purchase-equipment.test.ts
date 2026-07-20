import { describe, expect, it } from 'vitest'

import { equipmentSchema } from '../equipment'
import { canPurchaseEquipment } from './can-purchase-equipment'

const RULESET = 'srd-cc-5.2.1' as const

const pricedWeapon = equipmentSchema.parse({
  id: `${RULESET}:dagger`,
  slug: 'dagger',
  rulesetId: RULESET,
  source: 'system',
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

describe('canPurchaseEquipment', () => {
  it('returns false when cost is null', () => {
    expect(canPurchaseEquipment(unpricedItem)).toBe(false)
  })

  it('returns true when cost is present', () => {
    expect(canPurchaseEquipment(pricedWeapon)).toBe(true)
  })

  it('narrows cost to Money on success', () => {
    if (canPurchaseEquipment(pricedWeapon)) {
      expect(pricedWeapon.cost.amount).toBe(2)
    }
  })
})
