import {
  equipmentAdvisoryClass,
  resolveEquipmentNotProficientMessage,
  resolveEquipmentNotProficientShortLabel,
  type Equipment,
  type EquipmentPickerItem,
  type ResolvedEquipmentOption,
} from '@rpg/contracts'

import {
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  EQUIPMENT_PICKER_EXCEEDS_STARTING_BUDGET_LABEL,
} from '../../components/equipment/picker/drawer/equipment-picker-drawer.types'
import {
  mergeSelectionRowPresentations,
  selectionBlocker,
  selectionPresentationFromFacts,
  selectionWarning,
  type SelectionRowPresentation,
  type SelectionStatusEntry,
} from '../selection-row-status'

export type EquipmentPurchaseAvailability = EquipmentPickerItem['state']['purchaseAvailability']

export type EquipmentSelectionRowPresentationArgs = {
  equipment: Equipment
  resolved?: ResolvedEquipmentOption
  /** Acquisition surfaces only — emits the affordability blocker. */
  purchaseAvailability?: EquipmentPurchaseAvailability
  /** Structural miss against the max starting purse. Prefers that label over Cannot afford. */
  exceedsPurchaseBudgetCeiling?: boolean
  /** Surface-supplied availability blockers (purchase, grant, conversion). */
  blockers?: readonly SelectionStatusEntry[]
  /** Alternate-package source guidance only exists while shopping with gold. */
  isGoldShoppingPath?: boolean
  /** Proficiency fallback for rows without `resolved` facts. */
  isProficient?: boolean
}

function affordabilityBlockers(
  purchaseAvailability: EquipmentPurchaseAvailability | undefined,
  exceedsPurchaseBudgetCeiling: boolean | undefined,
): SelectionStatusEntry[] {
  if (exceedsPurchaseBudgetCeiling) {
    return [selectionBlocker('unaffordable', EQUIPMENT_PICKER_EXCEEDS_STARTING_BUDGET_LABEL)]
  }
  if (purchaseAvailability?.status !== 'unaffordable') return []
  return [selectionBlocker('unaffordable', EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL)]
}

function factsPresentation(args: EquipmentSelectionRowPresentationArgs): SelectionRowPresentation {
  const facts = (args.resolved?.presentation?.facts ?? []).filter(
    (fact) => args.isGoldShoppingPath || fact.discriminator !== 'alternative-package',
  )
  return selectionPresentationFromFacts(facts)
}

function proficiencyFallback(args: EquipmentSelectionRowPresentationArgs): SelectionStatusEntry[] {
  if (args.resolved || args.isProficient !== false) return []
  const equipmentClass = equipmentAdvisoryClass(args.equipment)
  if (!equipmentClass) return []
  return [
    selectionWarning('not_proficient', resolveEquipmentNotProficientShortLabel(), {
      detail: resolveEquipmentNotProficientMessage(equipmentClass),
    }),
  ]
}

/**
 * Every selection signal an equipment row supports, independent of surface.
 * Surfaces render it through `resolveSelectionRowStatusItems` with their context.
 */
export function resolveEquipmentSelectionRowPresentation(
  args: EquipmentSelectionRowPresentationArgs,
): SelectionRowPresentation {
  return mergeSelectionRowPresentations(
    {
      status: [
        ...affordabilityBlockers(args.purchaseAvailability, args.exceedsPurchaseBudgetCeiling),
        ...(args.blockers ?? []),
        ...proficiencyFallback(args),
      ],
      guidance: [],
    },
    factsPresentation(args),
  )
}
