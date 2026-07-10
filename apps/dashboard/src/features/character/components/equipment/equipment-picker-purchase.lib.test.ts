import { describe, expect, it } from 'vitest'

import {
  equipmentPickerBudgetFixture,
  equipmentPickerLongswordFixture,
} from './equipment-picker-drawer.fixtures'
import {
  buildEquipmentPickerPurchaseViewModel,
  EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL,
} from './equipment-picker-purchase.lib'

describe('buildEquipmentPickerPurchaseViewModel', () => {
  it('builds new-item purchase totals and remaining wealth', () => {
    expect(
      buildEquipmentPickerPurchaseViewModel({
        equipment: equipmentPickerLongswordFixture,
        quantity: 1,
        budget: equipmentPickerBudgetFixture,
        ownedQuantity: 0,
      }),
    ).toEqual({
      mode: 'new',
      quantity: 1,
      unitPriceLabel: '15 GP',
      totalLabel: '15 GP',
      remainingAfterLabel: '25 GP',
      commitLabel: EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL,
    })
  })

  it('caps quantity at one in phase 1', () => {
    expect(
      buildEquipmentPickerPurchaseViewModel({
        equipment: equipmentPickerLongswordFixture,
        quantity: 4,
        budget: equipmentPickerBudgetFixture,
        ownedQuantity: 0,
      })?.quantity,
    ).toBe(1)
  })

  it('omits purchase VM when the item is already owned', () => {
    expect(
      buildEquipmentPickerPurchaseViewModel({
        equipment: equipmentPickerLongswordFixture,
        quantity: 1,
        budget: equipmentPickerBudgetFixture,
        ownedQuantity: 1,
      }),
    ).toBeUndefined()
  })

  it('uses an em dash when budget is unavailable', () => {
    expect(
      buildEquipmentPickerPurchaseViewModel({
        equipment: equipmentPickerLongswordFixture,
        quantity: 1,
        ownedQuantity: 0,
      })?.remainingAfterLabel,
    ).toBe('—')
  })
})
