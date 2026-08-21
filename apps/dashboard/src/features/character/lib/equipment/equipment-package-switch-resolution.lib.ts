import {
  copperToWealth,
  formatEquipmentInventoryPriceLine,
  formatWealth,
  type CharacterBuildCatalogIndex,
  type EquipmentPackageSwitchBlockingReason,
  type EquipmentPackageSwitchEvaluation,
  type EquipmentStepActionIssue,
} from '@rpg/contracts'

import {
  EQUIPMENT_INVENTORY_GROUP_LABELS,
  formatEquipmentInventoryRemoveLabel,
  type EquipmentInventoryRow,
} from './equipment-step.lib'
import type { PurchasedCategoryGroup } from './equipment-inventory-summary.lib'

export const PACKAGE_SWITCH_RESOLUTION_TITLE = 'Resolve purchases before switching'

export const PACKAGE_SWITCH_BLOCKED_TITLE = 'Cannot switch packages'

export const PACKAGE_SWITCH_SAFETY_NOTE =
  'Changes are only applied when you select "Switch package."'

export const PACKAGE_SWITCH_STAGED_REMOVAL_LABEL = 'Staged for removal'

export const PACKAGE_SWITCH_STALE_INVENTORY_MESSAGE =
  'Your inventory changed while this dialog was open. The list has been updated.'

export const PACKAGE_SWITCH_CONFIRM_LABEL = 'Switch package'

export const PACKAGE_SWITCH_CANCEL_LABEL = 'Cancel'

export function formatPackageSwitchWealth(costCp: number): string {
  return formatWealth(copperToWealth(costCp))
}

export function mapBlockingReasonToMessage(
  reason: EquipmentPackageSwitchBlockingReason,
  args?: { targetOptionLabel?: string },
): string {
  const targetOptionLabel = args?.targetOptionLabel ?? 'the selected package'

  switch (reason.kind) {
    case 'nonEditableOverBudget':
      return `${formatPackageSwitchWealth(reason.nonEditableRetainedCostCp)} in purchases cannot be changed and exceeds the ${formatPackageSwitchWealth(reason.targetAllowanceCp)} allowed by ${targetOptionLabel}.`
    case 'staleCommittedInventory':
      return PACKAGE_SWITCH_STALE_INVENTORY_MESSAGE
    case 'draftOverBudget':
      return `Remove ${formatPackageSwitchWealth(reason.amountOverBudgetCp)} more to continue.`
    case 'invalidDraftQuantity':
      return 'One or more item quantities are invalid. Review your changes and try again.'
    case 'missingTargetOption':
      return 'The selected starting equipment option is no longer available.'
    case 'missingPurchase':
      return 'One or more purchased items are no longer in your inventory. Review the list and try again.'
    default: {
      const exhaustive: never = reason
      return String(exhaustive)
    }
  }
}

export function resolvePackageSwitchCommitErrorFromIssues(
  issues: readonly EquipmentStepActionIssue[],
): EquipmentPackageSwitchBlockingReason | undefined {
  for (const issue of issues) {
    switch (issue.code) {
      case 'package_switch_non_editable_over_budget':
        return {
          kind: 'nonEditableOverBudget',
          nonEditableRetainedCostCp: issue.reference.nonEditableRetainedCostCp,
          targetAllowanceCp: issue.reference.targetAllowanceCp,
        }
      case 'package_switch_stale_inventory':
        return {
          kind: 'staleCommittedInventory',
          expected: { purchases: [] },
          actual: { purchases: [] },
        }
      case 'package_switch_over_budget':
        return {
          kind: 'draftOverBudget',
          amountOverBudgetCp: issue.reference.amountOverBudgetCp,
        }
      case 'package_switch_invalid_quantity':
        return {
          kind: 'invalidDraftQuantity',
          purchaseId: issue.reference.purchaseId,
          committedQuantity: issue.reference.committedQuantity,
          draftQuantity: issue.reference.draftQuantity,
        }
      case 'package_switch_missing_target_option':
        return { kind: 'missingTargetOption' }
      case 'package_switch_missing_purchase':
        return { kind: 'missingPurchase', purchaseId: issue.reference.purchaseId }
      default:
        break
    }
  }

  return undefined
}

export function resolvePackageSwitchDescription(
  evaluation: EquipmentPackageSwitchEvaluation,
): string {
  const allowance = formatPackageSwitchWealth(evaluation.budget.targetAllowanceCp)
  const initialOverage = formatPackageSwitchWealth(evaluation.budget.initialAmountOverBudgetCp)

  return `${evaluation.targetOptionLabel} allows ${allowance} of purchased items. Reduce your current purchases by ${initialOverage} to switch packages. Your inventory will not change until you confirm.`
}

export function resolvePackageSwitchBudgetStatusLabel(
  evaluation: EquipmentPackageSwitchEvaluation,
  hasDraftEdits: boolean,
): { label: string; tone: 'warning' | 'success' | 'neutral' } {
  const { budget } = evaluation

  if (hasDraftEdits) {
    if (budget.amountOverBudgetCp > 0) {
      return {
        label: 'Still over budget',
        tone: 'warning',
      }
    }

    return {
      label: 'Remaining allowance',
      tone: 'success',
    }
  }

  return {
    label: 'Amount to remove',
    tone: 'warning',
  }
}

function inventoryGroupForEquipment(
  equipment: NonNullable<EquipmentInventoryRow['equipment']>,
): keyof typeof EQUIPMENT_INVENTORY_GROUP_LABELS {
  if (equipment.kind === 'weapon') return 'weapons'
  if (equipment.kind === 'armor') return 'armor'
  if (equipment.kind === 'tool') return 'tools'
  if (equipment.kind === 'vehicle') return 'vehicles'
  if (equipment.kind === 'mount') return 'mounts'
  if (equipment.kind === 'magic_item') return 'magicItems'
  return 'gear'
}

export function buildPackageSwitchDraftPurchasedGroups(args: {
  evaluation: EquipmentPackageSwitchEvaluation
  draftQuantitiesByPurchaseId: Record<string, number>
  catalogIndex: CharacterBuildCatalogIndex
}): PurchasedCategoryGroup[] {
  const displays = args.evaluation.editableItems.flatMap((item) => {
    const equipment = args.catalogIndex.equipment.get(item.equipmentId)
    if (!equipment) return []

    const draftQuantity =
      args.draftQuantitiesByPurchaseId[item.purchaseId] ?? item.committedQuantity
    const stagedRemoval = draftQuantity === 0
    const group = inventoryGroupForEquipment(equipment)

    const row: EquipmentInventoryRow = {
      group,
      groupLabel: EQUIPMENT_INVENTORY_GROUP_LABELS[group],
      entry: {
        equipmentId: item.equipmentId,
        quantity: draftQuantity,
        sources: [],
      },
      equipment,
      equipmentName: item.equipmentName,
      sourceLabel: stagedRemoval
        ? PACKAGE_SWITCH_STAGED_REMOVAL_LABEL
        : 'Purchased with starting gold',
      isStackable: item.isStackable,
      quantityMode: 'editable',
      maxQuantity: item.committedQuantity,
      priceLineLabel:
        draftQuantity > 0
          ? formatEquipmentInventoryPriceLine({
              equipment,
              quantity: draftQuantity,
              priceContext: 'startingGold',
            })
          : formatEquipmentInventoryPriceLine({
              equipment,
              quantity: 1,
              priceContext: 'startingGold',
            }),
      removeLabel: formatEquipmentInventoryRemoveLabel(item.equipmentName, draftQuantity || 1),
      removeTarget: { kind: 'purchase', purchaseId: item.purchaseId },
      quantityTarget: { kind: 'purchase', purchaseId: item.purchaseId },
      stagedRemoval,
    }

    return [{ kind: 'single' as const, row }]
  })

  if (displays.length === 0) return []

  return [
    {
      group: 'gear',
      groupLabel: EQUIPMENT_INVENTORY_GROUP_LABELS.gear,
      displays,
    },
  ]
}

export function packageSwitchDraftHasEdits(
  evaluation: EquipmentPackageSwitchEvaluation,
  draftQuantitiesByPurchaseId: Record<string, number>,
): boolean {
  return evaluation.editableItems.some((item) => {
    const draftQuantity = draftQuantitiesByPurchaseId[item.purchaseId] ?? item.committedQuantity
    return draftQuantity !== item.committedQuantity
  })
}

function blockingMessage(
  reason: EquipmentPackageSwitchBlockingReason,
  targetOptionLabel: string,
): string {
  return mapBlockingReasonToMessage(reason, { targetOptionLabel })
}

function resolvePackageSwitchInlineError(
  commitErrorReason: EquipmentPackageSwitchBlockingReason | undefined,
  targetOptionLabel: string,
): string | undefined {
  if (!commitErrorReason || commitErrorReason.kind === 'staleCommittedInventory') {
    return undefined
  }

  return blockingMessage(commitErrorReason, targetOptionLabel)
}

function resolvePackageSwitchStaleMessage(
  staleNotice: boolean | undefined,
  commitErrorReason: EquipmentPackageSwitchBlockingReason | undefined,
): string | undefined {
  if (staleNotice || commitErrorReason?.kind === 'staleCommittedInventory') {
    return PACKAGE_SWITCH_STALE_INVENTORY_MESSAGE
  }

  return undefined
}

function resolvePackageSwitchModalDescription(
  evaluation: EquipmentPackageSwitchEvaluation,
  isBlocked: boolean,
): string | undefined {
  if (!isBlocked) {
    return resolvePackageSwitchDescription(evaluation)
  }

  if (!evaluation.blockingReason) {
    return undefined
  }

  return blockingMessage(evaluation.blockingReason, evaluation.targetOptionLabel)
}

function resolvePackageSwitchHelperMessage(
  evaluation: EquipmentPackageSwitchEvaluation,
  confirmDisabled: boolean,
  isBlocked: boolean,
): string | undefined {
  if (!confirmDisabled || isBlocked) {
    return undefined
  }

  return blockingMessage(
    {
      kind: 'draftOverBudget',
      amountOverBudgetCp: evaluation.budget.amountOverBudgetCp,
    },
    evaluation.targetOptionLabel,
  )
}

export function resolvePackageSwitchModalState(args: {
  evaluation: EquipmentPackageSwitchEvaluation
  commitErrorReason?: EquipmentPackageSwitchBlockingReason
  staleNotice?: boolean
  isCommitting?: boolean
}) {
  const { evaluation } = args
  const isBlocked = evaluation.status === 'blocked'
  const confirmDisabled = !evaluation.budget.isDraftValid || Boolean(args.isCommitting)

  return {
    isBlocked,
    inlineError: resolvePackageSwitchInlineError(
      args.commitErrorReason,
      evaluation.targetOptionLabel,
    ),
    staleMessage: resolvePackageSwitchStaleMessage(args.staleNotice, args.commitErrorReason),
    title: isBlocked ? PACKAGE_SWITCH_BLOCKED_TITLE : PACKAGE_SWITCH_RESOLUTION_TITLE,
    description: resolvePackageSwitchModalDescription(evaluation, isBlocked),
    confirmDisabled,
    helperMessage: resolvePackageSwitchHelperMessage(evaluation, confirmDisabled, isBlocked),
  }
}
