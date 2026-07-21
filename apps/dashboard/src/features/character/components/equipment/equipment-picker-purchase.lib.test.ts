import { describe, expect, it } from 'vitest'

import {
  equipmentPickerBudgetFixture,
  equipmentPickerLongswordFixture,
  equipmentPickerRopeFixture,
} from './equipment-picker-drawer.fixtures'
import {
  buildEquipmentPickerPurchaseViewModel,
  EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL,
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
      maxQuantity: 2,
      unitPriceLabel: '15 GP',
      totalLabel: '15 GP',
      remainingAfterLabel: '25 GP',
      commitLabel: EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL,
    })
  })

  it('derives max quantity from budget for stackable gear', () => {
    expect(
      buildEquipmentPickerPurchaseViewModel({
        equipment: equipmentPickerRopeFixture,
        quantity: 4,
        budget: equipmentPickerBudgetFixture,
        ownedQuantity: 0,
      }),
    ).toEqual({
      mode: 'new',
      quantity: 4,
      maxQuantity: 40,
      unitPriceLabel: '1 GP',
      totalLabel: '4 GP',
      remainingAfterLabel: '36 GP',
      commitLabel: EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL,
    })
  })

  it('caps picker max quantity at 99 even with surplus budget', () => {
    const surplusBudget = {
      starting: { cp: 0, sp: 0, gp: 10_000, pp: 0 },
      spent: { cp: 0, sp: 0, gp: 0, pp: 0 },
      remaining: { cp: 0, sp: 0, gp: 10_000, pp: 0 },
    }

    expect(
      buildEquipmentPickerPurchaseViewModel({
        equipment: equipmentPickerRopeFixture,
        quantity: 1,
        budget: surplusBudget,
        ownedQuantity: 0,
      })?.maxQuantity,
    ).toBe(99)
  })

  it('builds owned stackable purchase VM with budget-aware max', () => {
    expect(
      buildEquipmentPickerPurchaseViewModel({
        equipment: equipmentPickerRopeFixture,
        quantity: 2,
        budget: equipmentPickerBudgetFixture,
        ownedQuantity: 2,
      }),
    ).toEqual({
      mode: 'owned',
      ownedQuantity: 2,
      quantity: 2,
      maxQuantity: 42,
      unitPriceLabel: '1 GP',
      totalLabel: '2 GP',
      remainingAfterLabel: '38 GP',
      commitLabel: EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL,
    })
  })

  it('builds owned purchase VM data for already-owned items', () => {
    expect(
      buildEquipmentPickerPurchaseViewModel({
        equipment: equipmentPickerLongswordFixture,
        quantity: 1,
        budget: equipmentPickerBudgetFixture,
        ownedQuantity: 1,
      }),
    ).toEqual({
      mode: 'owned',
      ownedQuantity: 1,
      quantity: 1,
      maxQuantity: 3,
      unitPriceLabel: '15 GP',
      totalLabel: '15 GP',
      remainingAfterLabel: '25 GP',
      commitLabel: EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL,
    })
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

  it('omits unit and total price labels for unpriced equipment', () => {
    const unpriced = {
      ...equipmentPickerLongswordFixture,
      id: 'srd-cc-5.2.1:priceless-longsword',
      slug: 'priceless-longsword',
      name: 'Priceless Longsword',
      cost: null,
    }

    expect(
      buildEquipmentPickerPurchaseViewModel({
        equipment: unpriced,
        quantity: 1,
        budget: equipmentPickerBudgetFixture,
        ownedQuantity: 0,
      }),
    ).toEqual({
      mode: 'new',
      quantity: 1,
      maxQuantity: 0,
      unitPriceLabel: '',
      totalLabel: '',
      remainingAfterLabel: '—',
      commitLabel: EQUIPMENT_PICKER_PURCHASE_COMMIT_LABEL,
    })
  })
})
