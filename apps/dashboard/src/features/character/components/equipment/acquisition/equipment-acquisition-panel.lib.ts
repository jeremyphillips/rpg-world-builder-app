import {
  formatMoney,
  formatWealthAsGold,
  resolveEquipmentAcquisitionActionState,
  copperToWealth,
  formatEquipmentPurchaseTotalPriceLabel,
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
  formatMagicItemUseChoicesLabel,
  resolveEquipmentAcquisitionContext,
  type EquipmentInventoryRow,
} from '../../../lib/equipment/equipment-step.lib'
import { formatAcquisitionBlockerNote } from '../picker/equipment-picker-action.lib'
import {
  formatGrantPreviewLine,
  formatTotalPurchaseSpendFromSnapshots,
  formatUsesGrantPreviewLine,
  resolveAllowanceRarity,
} from './equipment-acquisition-format.lib'
import { resolveEquipmentInventoryManageSources } from '../inventory/manage/equipment-inventory-manage.lib'

export {
  formatGrantPreviewLine,
  formatTotalPurchaseSpendFromSnapshots,
  formatUsesGrantPreviewLine,
  resolveAllowanceRarity,
} from './equipment-acquisition-format.lib'

export type EquipmentOwnedSourceAction = {
  kind: 'release_grant' | 'remove_purchase'
  quantity: 1
  label: string
  target:
    | { kind: 'magicItemGrant'; allowanceId: string; equipmentId: string }
    | { kind: 'purchase'; purchaseId: string }
}

export type EquipmentOwnedSourceViewModel = {
  key: string
  label: string
  quantity: number
  quantityLabel: string
  spendSuffix?: string
  action: EquipmentOwnedSourceAction
}

export type EquipmentAcquisitionPanelViewModel = {
  title?: string
  owned?: {
    heading: string
    totalQuantity: number
    sources: EquipmentOwnedSourceViewModel[]
  }
  nextAction: {
    heading?: string
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
  }
}

export function sumOwnedInventoryQuantity(rows: readonly EquipmentInventoryRow[]): number {
  return rows.reduce((sum, row) => sum + row.entry.quantity, 0)
}

export function formatOwnedPurchaseQuantityLabel(args: { quantity: number; unitCostCp?: number }): {
  quantityLabel: string
  spendSuffix?: string
} {
  const spendSuffix = formatTotalPurchaseSpendFromSnapshots([
    { quantity: args.quantity, unitCostCp: args.unitCostCp },
  ])

  if (!spendSuffix) {
    return { quantityLabel: String(args.quantity) }
  }

  return {
    quantityLabel: String(args.quantity),
    spendSuffix,
  }
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

  if (grantQuantity > 0 && purchaseQuantity === 0) {
    return formatMagicItemUseChoicesLabel(quantity)
  }

  if (quantity > 1) {
    return `Add ${quantity} to inventory`
  }

  return 'Add to inventory'
}

function formatMixedAcquisitionPreviewLine(args: {
  grantQuantity: number
  rarity: MagicItemRarity
  purchaseQuantity: number
  totalPurchasePrice: string
}): string {
  const grantPart = formatGrantPreviewLine(args.grantQuantity, args.rarity)
  const purchasePart =
    args.purchaseQuantity === 1
      ? `1 copy for ${args.totalPurchasePrice}`
      : `${args.purchaseQuantity} copies for ${args.totalPurchasePrice}`

  return `${grantPart} · ${purchasePart}`
}

function resolvePurchaseTotalPriceLabel(args: {
  purchaseQuantity: number
  unitCostCp?: number
  equipment: Equipment
}): string | undefined {
  if (args.purchaseQuantity <= 0) return undefined

  if (args.unitCostCp !== undefined) {
    return formatWealthAsGold(copperToWealth(args.unitCostCp * args.purchaseQuantity))
  }

  if (args.equipment.cost) {
    return formatEquipmentPurchaseTotalPriceLabel(args.equipment, args.purchaseQuantity)
  }

  return undefined
}

function resolvePlanGrantContext(args: {
  plan: EquipmentAcquisitionPlan
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
}): { grantQuantity: number; rarity?: MagicItemRarity } {
  const grantQuantity = args.plan.grantAllocations.reduce((sum, row) => sum + row.quantity, 0)
  const allowanceId = args.plan.grantAllocations[0]?.allowanceId
  const rarity =
    allowanceId !== undefined
      ? resolveAllowanceRarity({
          allowanceId,
          draft: args.draft,
          context: args.context,
          catalogIndex: args.catalogIndex,
        })
      : undefined

  return { grantQuantity, rarity }
}

function buildMixedPreviewLinesIfApplicable(args: {
  grantQuantity: number
  rarity?: MagicItemRarity
  plan: EquipmentAcquisitionPlan
  equipment: Equipment
}): string[] | undefined {
  if (args.grantQuantity <= 0 || args.plan.purchaseQuantity <= 0 || !args.rarity) {
    return undefined
  }

  const totalPurchasePrice = resolvePurchaseTotalPriceLabel({
    purchaseQuantity: args.plan.purchaseQuantity,
    unitCostCp: args.plan.unitCostCp,
    equipment: args.equipment,
  })

  if (!totalPurchasePrice) return undefined

  return [
    formatMixedAcquisitionPreviewLine({
      grantQuantity: args.grantQuantity,
      rarity: args.rarity,
      purchaseQuantity: args.plan.purchaseQuantity,
      totalPurchasePrice,
    }),
  ]
}

function formatPurchasePreviewLine(args: {
  purchaseQuantity: number
  unitCostCp?: number
  equipment: Equipment
}): string | undefined {
  if (args.purchaseQuantity <= 0) return undefined

  const unitLabel =
    args.unitCostCp !== undefined
      ? formatWealthAsGold(copperToWealth(args.unitCostCp))
      : args.equipment.cost
        ? formatMoney(args.equipment.cost)
        : undefined

  if (!unitLabel) return undefined

  return args.purchaseQuantity === 1
    ? `Purchased · ${unitLabel}`
    : `${args.purchaseQuantity} purchased · ${unitLabel} each`
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
  const { grantQuantity, rarity } = resolvePlanGrantContext({
    plan,
    draft,
    context,
    catalogIndex,
  })

  const mixedLines = buildMixedPreviewLinesIfApplicable({
    grantQuantity,
    rarity,
    plan,
    equipment,
  })
  if (mixedLines) return mixedLines

  const lines: string[] = []

  if (grantQuantity > 0 && rarity) {
    lines.push(formatUsesGrantPreviewLine(grantQuantity, rarity))
  }

  const purchaseLine = formatPurchasePreviewLine({
    purchaseQuantity: plan.purchaseQuantity,
    unitCostCp: plan.unitCostCp,
    equipment,
  })
  if (purchaseLine) lines.push(purchaseLine)

  return lines
}

function buildOwnedSourcesSection(
  rows: readonly EquipmentInventoryRow[],
  draft: CharacterBuilderDraft,
): EquipmentAcquisitionPanelViewModel['owned'] {
  const manageSources = resolveEquipmentInventoryManageSources(rows, draft)
  const sources: EquipmentOwnedSourceViewModel[] = [
    ...manageSources.grants.map((grant) => ({
      key: `grant:${grant.allowanceId}`,
      label: grant.label,
      quantity: grant.quantity,
      quantityLabel: String(grant.quantity),
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
    ...manageSources.purchases.map((purchase) => {
      const { quantityLabel, spendSuffix } = formatOwnedPurchaseQuantityLabel({
        quantity: purchase.quantity,
        unitCostCp: purchase.unitCostCp,
      })

      return {
        key: `purchase:${purchase.purchaseId}`,
        label: purchase.label,
        quantity: purchase.quantity,
        quantityLabel,
        spendSuffix,
        action: {
          kind: 'remove_purchase' as const,
          quantity: 1 as const,
          label: EQUIPMENT_INVENTORY_REMOVE_ONE_PURCHASE_LABEL,
          target: {
            kind: 'purchase' as const,
            purchaseId: purchase.purchaseId,
          },
        },
      }
    }),
  ]

  if (sources.length === 0) return undefined

  return {
    heading: EQUIPMENT_INVENTORY_OWNED_COPIES_LABEL,
    totalQuantity: sumOwnedInventoryQuantity(rows),
    sources,
  }
}

function buildBlockedNextAction(args: {
  requestedQuantity: number
  isPending?: boolean
  nextActionHeading?: string
}): EquipmentAcquisitionPanelViewModel['nextAction'] {
  return {
    heading: args.nextActionHeading,
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
  nextActionHeading?: string
}): EquipmentAcquisitionPanelViewModel['nextAction'] {
  const {
    actionState,
    equipment,
    draft,
    context,
    catalogIndex,
    requestedQuantity,
    isPending,
    nextActionHeading,
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
    heading: nextActionHeading,
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
}): EquipmentAcquisitionPanelViewModel {
  const { draft, context, catalogIndex, equipment, rows, requestedQuantity, isPending } = args

  const ownedTotalQuantity = sumOwnedInventoryQuantity(rows)
  const showOwnedSection = ownedTotalQuantity > 0
  const nextActionHeading = showOwnedSection ? EQUIPMENT_INVENTORY_NEXT_COPY_LABEL : undefined

  const acquisitionContext = resolveEquipmentAcquisitionContext({ context, catalogIndex })
  const actionState = resolveEquipmentAcquisitionActionState({
    draft,
    context: acquisitionContext,
    equipment,
    workflowMode: 'magic_items',
    requestedQuantity,
  })

  const owned = showOwnedSection ? buildOwnedSourcesSection(rows, draft) : undefined

  if (actionState.kind !== 'magic_item_grant') {
    return {
      owned,
      nextAction: buildBlockedNextAction({ requestedQuantity, isPending, nextActionHeading }),
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
      nextActionHeading,
    }),
  }
}

export function formatAcquisitionCommitSuccessButtonLabel(quantity: number): string {
  return `Added ${quantity} ✓`
}

/** Screen-reader announcement for a successful quantity commit. */
export function formatAcquisitionCommitSuccessAnnouncement(quantity: number): string {
  return `Added ${quantity} to inventory`
}

/** @deprecated Use {@link formatAcquisitionCommitSuccessAnnouncement}. */
export function formatAcquisitionSuccessMessage(quantity: number): string {
  return formatAcquisitionCommitSuccessAnnouncement(quantity)
}
