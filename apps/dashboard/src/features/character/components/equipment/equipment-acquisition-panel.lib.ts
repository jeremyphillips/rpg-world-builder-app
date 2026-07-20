import {
  formatMoney,
  formatWealthAsGold,
  getMagicItemRarityLabel,
  resolveEquipmentAcquisitionActionState,
  resolveMagicItemAcquisitionState,
  copperToWealth,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type Equipment,
  type EquipmentAcquisitionActionState,
  type EquipmentAcquisitionPlan,
  type EquipmentBudgetSummary,
  type MagicItemRarity,
} from '@rpg/contracts'

import {
  EQUIPMENT_ACQUISITION_BLOCKED_NOTE,
  EQUIPMENT_ACQUISITION_QUANTITY_LABEL,
  EQUIPMENT_INVENTORY_NEXT_COPY_LABEL,
  EQUIPMENT_INVENTORY_OWNED_COPIES_LABEL,
  EQUIPMENT_INVENTORY_RELEASE_ONE_LABEL,
  EQUIPMENT_INVENTORY_REMOVE_ONE_PURCHASE_LABEL,
  EQUIPMENT_MAGIC_ITEM_USE_CHOICE_LABEL,
  resolveEquipmentAcquisitionContext,
  type EquipmentInventoryRow,
} from '../../lib/equipment-step.lib'
import { formatAcquisitionBlockerNote } from './equipment-picker-action.lib'
import { resolveEquipmentInventoryManageSources } from './equipment-inventory-manage.lib'

export type EquipmentOwnedSourceAction = {
  kind: 'release_grant' | 'remove_purchase'
  quantity: 1
  label: string
  target:
    | { kind: 'magicItemGrant'; allowanceId: string; equipmentId: string }
    | { kind: 'purchase'; purchaseId: string }
}

export type EquipmentAcquisitionPanelViewModel = {
  title?: string
  owned?: {
    heading: string
    sources: Array<{
      key: string
      label: string
      quantity: number
      action: EquipmentOwnedSourceAction
    }>
    purchaseSpendLabel?: string
  }
  nextAction: {
    heading: string
    quantityLabel: typeof EQUIPMENT_ACQUISITION_QUANTITY_LABEL
    showQuantity: boolean
    quantity: number
    maxQuantity: number
    previewLines: string[]
    primaryActionLabel: string
    commitQuantity: number
    disabled: boolean
    isPending?: boolean
    blocked?: boolean
    blockerNote?: string
    successMessage?: string
  }
}

type PurchaseSnapshot = {
  purchaseId: string
  quantity: number
  unitCostCp?: number
}

export function formatTotalPurchaseSpendFromSnapshots(
  purchases: readonly PurchaseSnapshot[],
): string | undefined {
  let totalCp = 0
  let hasSnapshot = false

  for (const purchase of purchases) {
    if (purchase.unitCostCp === undefined) continue
    hasSnapshot = true
    totalCp += purchase.unitCostCp * purchase.quantity
  }

  if (!hasSnapshot || totalCp <= 0) return undefined
  return `${formatWealthAsGold(copperToWealth(totalCp))} spent`
}

export function formatAcquisitionCommitLabel(args: {
  plan: EquipmentAcquisitionPlan
  quantity: number
}): string {
  const { plan, quantity } = args

  if (plan.partialAction) {
    return `Add ${plan.partialAction.requestedQuantity} available`
  }

  const grantQuantity = plan.grantAllocations.reduce((sum, row) => sum + row.quantity, 0)
  const purchaseQuantity = plan.purchaseQuantity

  if (quantity > 1) {
    return `Add ${quantity} to inventory`
  }

  if (grantQuantity > 0 && purchaseQuantity === 0) {
    return EQUIPMENT_MAGIC_ITEM_USE_CHOICE_LABEL
  }

  return 'Add to inventory'
}

function formatGrantPreviewLine(grantQuantity: number, rarity: MagicItemRarity): string {
  const rarityLabel = getMagicItemRarityLabel(rarity)
  return grantQuantity === 1 ? `${rarityLabel} choice` : `${grantQuantity} ${rarityLabel} choices`
}

function resolveAllowanceRarity(args: {
  allowanceId: string
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
}): MagicItemRarity | undefined {
  const acquisition = resolveMagicItemAcquisitionState({
    draft: args.draft,
    context: args.context,
    catalogIndex: args.catalogIndex,
  })

  return acquisition.allowances.find((allowance) => allowance.id === args.allowanceId)?.rarity
}

function buildNextActionPreviewLines(args: {
  actionState: Extract<EquipmentAcquisitionActionState, { kind: 'magic_item_grant' }>
  equipment: Equipment
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
}): string[] {
  const { actionState, equipment, draft, context, catalogIndex } = args
  const { plan } = actionState
  const lines: string[] = []

  const grantQuantity = plan.grantAllocations.reduce((sum, row) => sum + row.quantity, 0)
  if (grantQuantity > 0) {
    const allowanceId = plan.grantAllocations[0]?.allowanceId
    const rarity =
      allowanceId !== undefined
        ? resolveAllowanceRarity({ allowanceId, draft, context, catalogIndex })
        : undefined

    if (rarity) {
      lines.push(formatGrantPreviewLine(grantQuantity, rarity))
    }
  }

  if (plan.purchaseQuantity > 0) {
    const unitLabel =
      plan.unitCostCp !== undefined
        ? formatWealthAsGold(copperToWealth(plan.unitCostCp))
        : equipment.cost
          ? formatMoney(equipment.cost)
          : undefined

    if (unitLabel) {
      lines.push(
        plan.purchaseQuantity === 1
          ? `Purchased · ${unitLabel}`
          : `${plan.purchaseQuantity} purchased · ${unitLabel} each`,
      )
    }
  }

  return lines
}

function buildOwnedSourcesSection(
  rows: readonly EquipmentInventoryRow[],
  draft: CharacterBuilderDraft,
): EquipmentAcquisitionPanelViewModel['owned'] {
  const manageSources = resolveEquipmentInventoryManageSources(rows, draft)
  const sources = [
    ...manageSources.grants.map((grant) => ({
      key: `grant:${grant.allowanceId}`,
      label: grant.label,
      quantity: grant.quantity,
      action: {
        kind: 'release_grant' as const,
        quantity: 1 as const,
        label: EQUIPMENT_INVENTORY_RELEASE_ONE_LABEL,
        target: {
          kind: 'magicItemGrant' as const,
          allowanceId: grant.allowanceId,
          equipmentId: grant.equipmentId,
        },
      },
    })),
    ...manageSources.purchases.map((purchase) => ({
      key: `purchase:${purchase.purchaseId}`,
      label: purchase.label,
      quantity: purchase.quantity,
      action: {
        kind: 'remove_purchase' as const,
        quantity: 1 as const,
        label: EQUIPMENT_INVENTORY_REMOVE_ONE_PURCHASE_LABEL,
        target: {
          kind: 'purchase' as const,
          purchaseId: purchase.purchaseId,
        },
      },
    })),
  ]

  if (sources.length === 0) return undefined

  return {
    heading: EQUIPMENT_INVENTORY_OWNED_COPIES_LABEL,
    sources,
    purchaseSpendLabel: formatTotalPurchaseSpendFromSnapshots(
      manageSources.purchases.map((purchase) => ({
        purchaseId: purchase.purchaseId,
        quantity: purchase.quantity,
        unitCostCp: purchase.unitCostCp,
      })),
    ),
  }
}

function buildBlockedNextAction(args: {
  requestedQuantity: number
  isPending?: boolean
  successMessage?: string
}): EquipmentAcquisitionPanelViewModel['nextAction'] {
  return {
    heading: EQUIPMENT_INVENTORY_NEXT_COPY_LABEL,
    quantityLabel: EQUIPMENT_ACQUISITION_QUANTITY_LABEL,
    showQuantity: false,
    quantity: args.requestedQuantity,
    maxQuantity: 1,
    previewLines: [],
    primaryActionLabel: 'Add to inventory',
    commitQuantity: args.requestedQuantity,
    disabled: true,
    blocked: true,
    blockerNote: EQUIPMENT_ACQUISITION_BLOCKED_NOTE,
    isPending: args.isPending,
    successMessage: args.successMessage,
  }
}

function buildGrantNextAction(args: {
  actionState: Extract<EquipmentAcquisitionActionState, { kind: 'magic_item_grant' }>
  equipment: Equipment
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  requestedQuantity: number
  isPending?: boolean
  successMessage?: string
}): EquipmentAcquisitionPanelViewModel['nextAction'] {
  const {
    actionState,
    equipment,
    draft,
    context,
    catalogIndex,
    requestedQuantity,
    isPending,
    successMessage,
  } = args
  const { plan, capabilities, quantityBounds } = actionState
  const maxAdditionalQuantity = quantityBounds.maxAdditionalQuantity
  const blocked = maxAdditionalQuantity === 0
  const commitQuantity = plan.partialAction?.requestedQuantity ?? requestedQuantity

  const blockerNote =
    blocked && capabilities.addBlockedReason
      ? formatAcquisitionBlockerNote(capabilities.addBlockedReason)
      : blocked
        ? EQUIPMENT_ACQUISITION_BLOCKED_NOTE
        : undefined

  return {
    heading: EQUIPMENT_INVENTORY_NEXT_COPY_LABEL,
    quantityLabel: EQUIPMENT_ACQUISITION_QUANTITY_LABEL,
    showQuantity: maxAdditionalQuantity > 1,
    quantity: requestedQuantity,
    maxQuantity: Math.max(1, maxAdditionalQuantity),
    previewLines: buildNextActionPreviewLines({
      actionState,
      equipment,
      draft,
      context,
      catalogIndex,
    }),
    primaryActionLabel: formatAcquisitionCommitLabel({ plan, quantity: commitQuantity }),
    commitQuantity,
    disabled:
      blocked ||
      isPending === true ||
      (!plan.canApplyRequestedQuantity && plan.partialAction === undefined),
    isPending,
    blocked,
    blockerNote,
    successMessage,
  }
}

export function buildEquipmentAcquisitionPanelViewModel(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  equipment: Equipment
  rows: readonly EquipmentInventoryRow[]
  requestedQuantity: number
  budget?: EquipmentBudgetSummary
  isPending?: boolean
  successMessage?: string
}): EquipmentAcquisitionPanelViewModel {
  const {
    draft,
    context,
    catalogIndex,
    equipment,
    rows,
    requestedQuantity,
    isPending,
    successMessage,
  } = args

  const acquisitionContext = resolveEquipmentAcquisitionContext({ context, catalogIndex })
  const actionState = resolveEquipmentAcquisitionActionState({
    draft,
    context: acquisitionContext,
    equipment,
    workflowMode: 'magic_items',
    requestedQuantity,
  })

  const owned = buildOwnedSourcesSection(rows, draft)

  if (actionState.kind !== 'magic_item_grant') {
    return {
      owned,
      nextAction: buildBlockedNextAction({ requestedQuantity, isPending, successMessage }),
    }
  }

  return {
    owned,
    nextAction: buildGrantNextAction({
      actionState,
      equipment,
      draft,
      context,
      catalogIndex,
      requestedQuantity,
      isPending,
      successMessage,
    }),
  }
}

export function formatAcquisitionSuccessMessage(quantity: number): string {
  return `Added ${quantity} to inventory`
}
