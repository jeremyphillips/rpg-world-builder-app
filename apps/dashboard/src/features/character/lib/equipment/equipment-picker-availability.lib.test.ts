import { describe, expect, it } from 'vitest'

import {
  equipmentPickerBudgetFixture,
  equipmentPickerChainMailFixture,
  equipmentPickerItemsFixture,
  equipmentPickerPotionFixture,
  pickerState,
} from '../../components/equipment/picker/equipment-picker-drawer.fixtures'
import type { EquipmentPickerItem } from '../../components/equipment/picker/equipment-picker-drawer.types'
import {
  resolveEquipmentPickerPurchaseActionState,
  resolveEquipmentPickerRowAvailabilityVm,
} from './equipment-picker-availability.lib'

describe('equipment-picker-availability.lib', () => {
  it('keeps purchase-eligible unaffordable rows content-available with distinct action reason', () => {
    const chainMail = equipmentPickerItemsFixture[1]!
    const vm = resolveEquipmentPickerRowAvailabilityVm(chainMail, {
      budget: equipmentPickerBudgetFixture,
      contentAvailable: true,
    })
    const action = resolveEquipmentPickerPurchaseActionState(chainMail, {
      budget: equipmentPickerBudgetFixture,
      contentAvailable: true,
    })

    expect(vm).toEqual({
      contentAvailable: true,
      purchaseEligible: true,
      affordable: false,
    })
    expect(action).toEqual({ disabled: true, reason: 'unaffordable' })
  })

  it('marks null-cost items purchase-ineligible without unaffordable reason', () => {
    const unpricedMagicItem: EquipmentPickerItem = {
      equipment: equipmentPickerPotionFixture,
      state: pickerState({
        isAvailable: true,
        isRecommended: false,
        isProficient: true,
        isAffordable: true,
        isWithinRemainingBudget: true,
        purchaseAvailability: { status: 'unavailable', reason: 'no_market_price' },
        recommendation: { tier: 'neutral', reasons: [], specificity: 'exact' },
        disabledReasons: [],
      }),
    }

    const vm = resolveEquipmentPickerRowAvailabilityVm(unpricedMagicItem)
    const action = resolveEquipmentPickerPurchaseActionState(unpricedMagicItem)

    expect(vm.purchaseEligible).toBe(false)
    expect(vm.affordable).toBe(true)
    expect(action).toEqual({ disabled: true, reason: 'not_purchasable' })
  })

  it('keeps content and purchase eligibility stable when only remaining funds change', () => {
    const affordableItem: EquipmentPickerItem = {
      ...equipmentPickerItemsFixture[1]!,
      equipment: {
        ...equipmentPickerChainMailFixture,
        cost: { amount: 10, currency: 'gp' },
      },
      state: {
        ...equipmentPickerItemsFixture[1]!.state,
        isWithinRemainingBudget: true,
        purchaseAvailability: { status: 'available' },
      },
    }
    const unaffordableItem: EquipmentPickerItem = {
      ...affordableItem,
      state: {
        ...affordableItem.state,
        isWithinRemainingBudget: false,
        purchaseAvailability: { status: 'unaffordable', shortfallCp: 1000 },
      },
    }

    const options = { budget: equipmentPickerBudgetFixture, contentAvailable: true }
    const vmBefore = resolveEquipmentPickerRowAvailabilityVm(affordableItem, options)
    const vmAfter = resolveEquipmentPickerRowAvailabilityVm(unaffordableItem, options)
    const actionBefore = resolveEquipmentPickerPurchaseActionState(affordableItem, options)
    const actionAfter = resolveEquipmentPickerPurchaseActionState(unaffordableItem, options)

    expect(vmBefore.contentAvailable).toBe(true)
    expect(vmAfter.contentAvailable).toBe(true)
    expect(vmBefore.purchaseEligible).toBe(true)
    expect(vmAfter.purchaseEligible).toBe(true)
    expect(vmBefore.affordable).toBe(true)
    expect(vmAfter.affordable).toBe(false)
    expect(actionBefore).toEqual({ disabled: false })
    expect(actionAfter).toEqual({ disabled: true, reason: 'unaffordable' })
  })
})
