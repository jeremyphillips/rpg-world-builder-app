import {
  formatEquipmentPurchaseTotalPriceLabel,
  getMagicItemRarityLabel,
  resolveEquipmentAcquisitionActionState,
  resolveMagicItemAcquisitionState,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type Equipment,
  type EquipmentAcquisitionActionState,
  type EquipmentBudgetSummary,
  type MagicItemRarity,
} from '@rpg/contracts'

import {
  resolveEquipmentAcquisitionContext,
  type EquipmentInventoryRow,
} from '../../lib/equipment-step.lib'
import { formatAcquisitionBlockerNote } from './equipment-picker-action.lib'

export type EquipmentAcquisitionSourceKind = 'magicItemGrant' | 'purchase'

export type EquipmentInventoryRowManagementMode =
  | { kind: 'purchase_only' }
  | { kind: 'grant_only'; totalQuantity: number }
  | { kind: 'mixed'; totalQuantity: number }

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

export function usesMixedSourceManagement(rows: readonly EquipmentInventoryRow[]): boolean {
  return resolveDistinctAcquisitionSourceKinds(rows).length > 1
}

function sumRowQuantity(rows: readonly EquipmentInventoryRow[]): number {
  return rows.reduce((sum, row) => sum + row.entry.quantity, 0)
}

export function resolveEquipmentInventoryRowManagementMode(
  rows: readonly EquipmentInventoryRow[],
): EquipmentInventoryRowManagementMode {
  const kinds = resolveDistinctAcquisitionSourceKinds(rows)

  if (kinds.length === 0) {
    return { kind: 'purchase_only' }
  }

  if (kinds.length > 1) {
    return { kind: 'mixed', totalQuantity: sumRowQuantity(rows) }
  }

  if (kinds[0] === 'purchase') {
    return { kind: 'purchase_only' }
  }

  return { kind: 'grant_only', totalQuantity: sumRowQuantity(rows) }
}

export function formatGrantManageSourceLabel(sourceLabel: string): string {
  const rarity = sourceLabel.replace(/\s+choice$/i, '')
  return `${rarity} magic-item choices`
}

export function resolveEquipmentInventoryManageSources(
  rows: readonly EquipmentInventoryRow[],
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

    if (row.removeTarget?.kind === 'purchase' && row.equipment) {
      purchases.push({
        purchaseId: row.removeTarget.purchaseId,
        label: 'Purchased',
        quantity: row.entry.quantity,
        totalPriceLabel: formatEquipmentPurchaseTotalPriceLabel(row.equipment, row.entry.quantity),
      })
    }
  }

  return {
    grants: [...grants.values()],
    purchases,
  }
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

function formatGrantAddAnotherLabel(grantQuantity: number, rarity: MagicItemRarity): string {
  const rarityLabel = getMagicItemRarityLabel(rarity)
  return grantQuantity === 1
    ? `Uses 1 ${rarityLabel} choice`
    : `Uses ${grantQuantity} ${rarityLabel} choices`
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
        label: formatGrantAddAnotherLabel(grantQuantity, rarity),
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
    requestedQuantity: 1,
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
