import { describe, expect, it } from 'vitest'

import { EQUIPMENT_PURCHASE_QUANTITY_MAX } from '@rpg/contracts'

import {
  equipmentPickerBudgetFixture,
  equipmentPickerLongswordFixture,
  equipmentPickerRopeFixture,
} from '../../components/equipment/picker/equipment-picker-drawer.fixtures'
import {
  clampEquipmentStepQuantity,
  EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS,
  resolveEquipmentStepPurchaseMaxQuantity,
} from './equipment-quantity.lib'

describe('equipment-quantity.lib', () => {
  it('exposes the shared hard cap and input digit width', () => {
    expect(EQUIPMENT_PURCHASE_QUANTITY_MAX).toBe(99)
    expect(EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS).toBe(2)
  })

  it('clamps quantities to the shared hard cap', () => {
    expect(clampEquipmentStepQuantity(120, 200)).toBe(99)
    expect(clampEquipmentStepQuantity(0, 40)).toBe(1)
    expect(clampEquipmentStepQuantity(12, 40)).toBe(12)
  })

  it('resolves budget-limited max quantities for picker and inventory inputs', () => {
    expect(
      resolveEquipmentStepPurchaseMaxQuantity({
        equipment: equipmentPickerRopeFixture,
        budget: equipmentPickerBudgetFixture,
        currentQuantity: 0,
      }),
    ).toBe(40)

    expect(
      resolveEquipmentStepPurchaseMaxQuantity({
        equipment: equipmentPickerLongswordFixture,
        budget: equipmentPickerBudgetFixture,
        currentQuantity: 0,
      }),
    ).toBe(2)
  })

  it('caps resolved max at 99 when budget allows more', () => {
    expect(
      resolveEquipmentStepPurchaseMaxQuantity({
        equipment: equipmentPickerRopeFixture,
        budget: {
          starting: { cp: 0, sp: 0, gp: 10_000, pp: 0 },
          spent: { cp: 0, sp: 0, gp: 0, pp: 0 },
          remaining: { cp: 0, sp: 0, gp: 10_000, pp: 0 },
        },
        currentQuantity: 0,
      }),
    ).toBe(99)
  })
})
