import {
  formatEquipmentPurchaseTotalPriceLabel,
  formatWealthAsGold,
  resolveEquipmentAcquisitionActionState,
  resolveEquipmentPurchaseIndex,
  unitCostCpForEquipment,
  copperToWealth,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type Equipment,
  type EquipmentAcquisitionActionState,
  type EquipmentBudgetSummary,
} from '@rpg/contracts'

import {
  resolveEquipmentAcquisitionContext,
  type EquipmentInventoryRow,
} from '../../lib/equipment/equipment-step.lib'
import { formatAcquisitionBlockerNote } from './equipment-picker-action.lib'
import {
  formatUsesGrantPreviewLine,
  resolveAllowanceRarity,
} from './equipment-acquisition-format.lib'

export type EquipmentAcquisitionSourceKind = 'magicItemGrant' | 'purchase'

export type EquipmentInventoryManageGrantSource = {
  allowanceId: string
  equipmentId: string
  label: string
  quantity: number
}

export type EquipmentInventoryManagePurchaseSource = {
  purchaseId: string
  label: string
  quantity: number
  unitCostCp?: number
  totalPriceLabel: string
}

export type EquipmentInventoryManageSources = {
  grants: EquipmentInventoryManageGrantSource[]
  purchases: EquipmentInventoryManagePurchaseSource[]
}

export type EquipmentInventoryAddAnotherPreview = {
  canAdd: boolean
  label: string
  blockerNote?: string
}

const ACQUISITION_SOURCE_KIND_ORDER: EquipmentAcquisitionSourceKind[] = [
  'magicItemGrant',
  'purchase',
]

export function resolveDistinctAcquisitionSourceKinds(
  rows: readonly EquipmentInventoryRow[],
): EquipmentAcquisitionSourceKind[] {
  const kinds = new Set<EquipmentAcquisitionSourceKind>()

  for (const row of rows) {
    if (row.removeTarget?.kind === 'magicItemGrant') kinds.add('magicItemGrant')
    if (row.removeTarget?.kind === 'purchase') kinds.add('purchase')
  }

  return ACQUISITION_SOURCE_KIND_ORDER.filter((kind) => kinds.has(kind))
}

export { formatTotalPurchaseSpendFromSnapshots } from './equipment-acquisition-format.lib'

export function grantedQuantity(rows: readonly EquipmentInventoryRow[]): number {
  return rows.reduce((sum, row) => {
    if (row.removeTarget?.kind === 'magicItemGrant') {
      return sum + row.entry.quantity
    }
    return sum
  }, 0)
}

export function usesInlineManagement(args: {
  sourceKinds: EquipmentAcquisitionSourceKind[]
  grantedQuantity: number
}): boolean {
  return args.sourceKinds.length > 1 || args.grantedQuantity > 1
}

/** @deprecated Use {@link usesInlineManagement}. */
export function usesMixedSourceManagement(rows: readonly EquipmentInventoryRow[]): boolean {
  return usesInlineManagement({
    sourceKinds: resolveDistinctAcquisitionSourceKinds(rows),
    grantedQuantity: grantedQuantity(rows),
  })
}

function sumRowQuantity(rows: readonly EquipmentInventoryRow[]): number {
  return rows.reduce((sum, row) => sum + row.entry.quantity, 0)
}

export function resolveEquipmentInventoryRowManagementMode(
  rows: readonly EquipmentInventoryRow[],
): { kind: 'purchase_only' } | { kind: 'inline'; totalQuantity: number } {
  const sourceKinds = resolveDistinctAcquisitionSourceKinds(rows)
  const grantQty = grantedQuantity(rows)

  if (sourceKinds.length === 0 || (sourceKinds.length === 1 && sourceKinds[0] === 'purchase')) {
    return { kind: 'purchase_only' }
  }

  if (sourceKinds.length === 1 && grantQty === 1) {
    return { kind: 'purchase_only' }
  }

  return { kind: 'inline', totalQuantity: sumRowQuantity(rows) }
}

export function formatGrantManageSourceLabel(sourceLabel: string): string {
  const rarity = sourceLabel.replace(/\s+choice$/i, '')
  return `${rarity} choices`
}

function resolvePurchaseUnitCostCp(args: {
  purchaseId: string
  draft: CharacterBuilderDraft
  equipment?: Equipment
}): number | undefined {
  const purchases = args.draft.equipment?.purchases ?? []
  const resolvedIndex = resolveEquipmentPurchaseIndex(purchases, args.purchaseId)
  if (resolvedIndex === undefined) {
    return args.equipment ? unitCostCpForEquipment(args.equipment) : undefined
  }

  const purchase = purchases[resolvedIndex]
  return (
    purchase?.unitCostCp ?? (args.equipment ? unitCostCpForEquipment(args.equipment) : undefined)
  )
}

export function resolveEquipmentInventoryManageSources(
  rows: readonly EquipmentInventoryRow[],
  draft?: CharacterBuilderDraft,
): EquipmentInventoryManageSources {
  const grants = new Map<string, EquipmentInventoryManageGrantSource>()
  const purchases: EquipmentInventoryManagePurchaseSource[] = []

  for (const row of rows) {
    if (row.removeTarget?.kind === 'magicItemGrant') {
      const existing = grants.get(row.removeTarget.allowanceId)
      if (existing) {
        existing.quantity += row.entry.quantity
        continue
      }

      grants.set(row.removeTarget.allowanceId, {
        allowanceId: row.removeTarget.allowanceId,
        equipmentId: row.removeTarget.equipmentId,
        label: formatGrantManageSourceLabel(row.sourceLabel),
        quantity: row.entry.quantity,
      })
      continue
    }

    if (row.removeTarget?.kind === 'purchase') {
      const unitCostCp =
        draft !== undefined
          ? resolvePurchaseUnitCostCp({
              purchaseId: row.removeTarget.purchaseId,
              draft,
              equipment: row.equipment,
            })
          : undefined

      const totalPriceLabel =
        unitCostCp !== undefined
          ? formatWealthAsGold(copperToWealth(unitCostCp * row.entry.quantity))
          : row.equipment
            ? formatEquipmentPurchaseTotalPriceLabel(row.equipment, row.entry.quantity)
            : ''

      purchases.push({
        purchaseId: row.removeTarget.purchaseId,
        label: 'Purchased',
        quantity: row.entry.quantity,
        unitCostCp,
        totalPriceLabel,
      })
    }
  }

  return {
    grants: [...grants.values()],
    purchases,
  }
}

function formatMagicItemGrantAddAnotherPreview(args: {
  actionState: Extract<EquipmentAcquisitionActionState, { kind: 'magic_item_grant' }>
  equipment: Equipment
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
}): EquipmentInventoryAddAnotherPreview {
  const { actionState, equipment, draft, context, catalogIndex } = args
  const { plan, capabilities } = actionState

  if (!capabilities.canAdd && !plan.canApplyRequestedQuantity) {
    return {
      canAdd: false,
      label: 'Add another',
      blockerNote: capabilities.addBlockedReason
        ? formatAcquisitionBlockerNote(capabilities.addBlockedReason)
        : 'This item cannot be added.',
    }
  }

  const grantQuantity = plan.grantAllocations.reduce((sum, row) => sum + row.quantity, 0)
  if (grantQuantity > 0) {
    const allowanceId = plan.grantAllocations[0]?.allowanceId
    const rarity =
      allowanceId !== undefined
        ? resolveAllowanceRarity({ allowanceId, draft, context, catalogIndex })
        : undefined

    if (rarity) {
      return {
        canAdd: plan.canApplyRequestedQuantity,
        label: formatUsesGrantPreviewLine(grantQuantity, rarity),
      }
    }
  }

  if (plan.purchaseQuantity > 0) {
    return {
      canAdd: plan.canApplyRequestedQuantity,
      label: `Costs ${formatEquipmentPurchaseTotalPriceLabel(equipment, plan.purchaseQuantity)}`,
    }
  }

  return {
    canAdd: false,
    label: 'Add another',
    blockerNote: 'This item cannot be added.',
  }
}

export function formatInventoryAddAnotherPreview(args: {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  equipment: Equipment
  budget?: EquipmentBudgetSummary
  requestedQuantity?: number
}): EquipmentInventoryAddAnotherPreview {
  const acquisitionContext = resolveEquipmentAcquisitionContext({
    context: args.context,
    catalogIndex: args.catalogIndex,
  })
  const actionState = resolveEquipmentAcquisitionActionState({
    draft: args.draft,
    context: acquisitionContext,
    equipment: args.equipment,
    workflowMode: 'magic_items',
    requestedQuantity: args.requestedQuantity ?? 1,
  })

  if (actionState.kind !== 'magic_item_grant') {
    return {
      canAdd: false,
      label: 'Add another',
      blockerNote: 'This item cannot be added.',
    }
  }

  return formatMagicItemGrantAddAnotherPreview({
    actionState,
    equipment: args.equipment,
    draft: args.draft,
    context: args.context,
    catalogIndex: args.catalogIndex,
  })
}
