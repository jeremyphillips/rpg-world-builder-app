import type { EquipmentBudgetSummary, EquipmentPickerItem } from '@rpg/contracts'

export type EquipmentPickerRowAvailabilityVm = {
  /** Campaign/content gate — row may participate in picker universe when true. */
  contentAvailable: boolean
  /** Purchase channel supported (priced / supported kind). */
  purchaseEligible: boolean
  /** Remaining budget covers requested purchase qty when budget is active. */
  affordable: boolean
}

export type EquipmentPickerPurchaseActionReason =
  | 'content_unavailable'
  | 'not_purchasable'
  | 'unaffordable'
  | 'blocked'

export type EquipmentPickerPurchaseActionState = {
  disabled: boolean
  reason?: EquipmentPickerPurchaseActionReason
}

export type EquipmentPickerAvailabilityOptions = {
  budget?: EquipmentBudgetSummary
  /**
   * When equipment-step picker universe is wired through `resolvePlayableBuilderContent`,
   * rows in the list pass `true`. Omit only when content wiring is inactive.
   */
  contentAvailable?: boolean
}

/** Maps existing purchase/content signals to explicit row availability fields. */
export function resolveEquipmentPickerRowAvailabilityVm(
  item: EquipmentPickerItem,
  options?: EquipmentPickerAvailabilityOptions,
): EquipmentPickerRowAvailabilityVm {
  const contentAvailable = options?.contentAvailable ?? true
  const purchaseEligible = item.state.purchaseAvailability.status !== 'unavailable'
  /** Remaining-budget signal stamped at `resolveEquipmentPickerItems` time. */
  const affordable = item.state.isWithinRemainingBudget

  return { contentAvailable, purchaseEligible, affordable }
}

/** Purchase add/manage action state — does not collapse unaffordable into unavailable. */
export function resolveEquipmentPickerPurchaseActionState(
  item: EquipmentPickerItem,
  options?: EquipmentPickerAvailabilityOptions,
): EquipmentPickerPurchaseActionState {
  if (item.state.disabledReasons.length > 0) {
    return { disabled: true, reason: 'blocked' }
  }

  const vm = resolveEquipmentPickerRowAvailabilityVm(item, options)

  if (!vm.contentAvailable) {
    return { disabled: true, reason: 'content_unavailable' }
  }
  if (!vm.purchaseEligible) {
    return { disabled: true, reason: 'not_purchasable' }
  }
  if (!vm.affordable) {
    return { disabled: true, reason: 'unaffordable' }
  }

  return { disabled: false }
}
