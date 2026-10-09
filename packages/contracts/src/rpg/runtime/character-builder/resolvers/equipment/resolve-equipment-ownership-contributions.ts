import { canPurchaseEquipment } from '../../../../content/equipment/can-purchase-equipment'
import type { MagicItemRarity } from '../../../../vocab/magic-item/rarity'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft/draft'
import type { MagicItemAllowanceRequirement } from '../../equipment/magic-item-selection'
import type { StartingWealthRules } from '../../../../campaign/rules/starting-wealth'
import type { SystemRulesetId } from '../../../../primitives/ruleset'
import {
  listAppliedMagicItemGrantSelections,
  listCountedEquipmentPurchases,
  resolveGenericEquipmentGrantQuantities,
  resolvePackageEquipmentQuantities,
} from './derive-equipment-draft-entries'
import { moneyToCopper, type EquipmentBudgetSummary } from './equipment-budget'
import { resolveEquipmentPurchaseQuantityLimits } from './resolve-equipment-purchase-quantity-limits'

/** Where a purchase row came from. `manual` rows are outside the starting-gold channel. */
export type EquipmentOwnershipPurchaseOrigin = 'picker' | 'packageConversion' | 'manual'

/**
 * One source-complete slice of ownership for a single equipment id. Contributions
 * partition the derived inventory quantity: they always sum to it.
 */
export type EquipmentOwnershipContribution =
  | { kind: 'package'; quantity: number }
  | { kind: 'grant'; quantity: number }
  | {
      kind: 'magic_choice'
      allowanceId: string
      rarity: MagicItemRarity
      requirement: MagicItemAllowanceRequirement
      quantity: number
    }
  | {
      kind: 'purchase'
      purchaseId: string
      origin: EquipmentOwnershipPurchaseOrigin
      quantity: number
      unitCostCp?: number
      /** Quantity is adjustable through the purchase channel (stackable starting gold). */
      editable: boolean
    }

export type EquipmentOwnershipContributionsOptions = {
  startingWealth?: StartingWealthRules
  rulesetId?: SystemRulesetId
  magicItemRequirement?: MagicItemAllowanceRequirement
  budget?: EquipmentBudgetSummary
}

function appendContribution(
  byEquipmentId: Map<string, EquipmentOwnershipContribution[]>,
  equipmentId: string,
  contribution: EquipmentOwnershipContribution,
): void {
  const existing = byEquipmentId.get(equipmentId)
  if (existing) {
    existing.push(contribution)
    return
  }
  byEquipmentId.set(equipmentId, [contribution])
}

function appendPackageContributions(
  byEquipmentId: Map<string, EquipmentOwnershipContribution[]>,
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): void {
  for (const [equipmentId, quantity] of resolvePackageEquipmentQuantities(draft, catalogIndex)) {
    if (quantity > 0) appendContribution(byEquipmentId, equipmentId, { kind: 'package', quantity })
  }
}

function appendMagicChoiceContributions(
  byEquipmentId: Map<string, EquipmentOwnershipContribution[]>,
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  options?: EquipmentOwnershipContributionsOptions,
): void {
  for (const selection of listAppliedMagicItemGrantSelections(draft, catalogIndex, options)) {
    appendContribution(byEquipmentId, selection.equipmentId, {
      kind: 'magic_choice',
      allowanceId: selection.allowanceId,
      rarity: selection.rarity,
      requirement: selection.requirement,
      quantity: selection.quantity,
    })
  }
}

function appendPurchaseContributions(
  byEquipmentId: Map<string, EquipmentOwnershipContribution[]>,
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  options?: EquipmentOwnershipContributionsOptions,
): void {
  for (const purchase of listCountedEquipmentPurchases(draft, catalogIndex)) {
    const equipment = catalogIndex.equipment.get(purchase.equipmentId)!
    const origin: EquipmentOwnershipPurchaseOrigin =
      purchase.sourceMode === 'manual' ? 'manual' : purchase.origin
    const limits = resolveEquipmentPurchaseQuantityLimits({
      equipment,
      sourceMode: purchase.sourceMode,
      origin: purchase.sourceMode === 'startingGold' ? purchase.origin : undefined,
      budget: options?.budget,
      currentQuantity: purchase.quantity,
      isPurchaseRow: true,
    })

    appendContribution(byEquipmentId, purchase.equipmentId, {
      kind: 'purchase',
      purchaseId: purchase.id,
      origin,
      quantity: purchase.quantity,
      ...(canPurchaseEquipment(equipment)
        ? { unitCostCp: purchase.unitCostCp ?? moneyToCopper(equipment.cost) }
        : {}),
      editable: limits.editable,
    })
  }
}

function appendGrantContributions(
  byEquipmentId: Map<string, EquipmentOwnershipContribution[]>,
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  options?: EquipmentOwnershipContributionsOptions,
): void {
  for (const [equipmentId, quantity] of resolveGenericEquipmentGrantQuantities(
    draft,
    catalogIndex,
    options,
  )) {
    if (quantity > 0) appendContribution(byEquipmentId, equipmentId, { kind: 'grant', quantity })
  }
}

/**
 * Source-complete ownership model for the current draft — package rows, generic
 * grants, magic-item choices (one per allowance), and purchase records (one per
 * row). The per-id sum equals the quantity `deriveEquipmentDraftEntries` produces.
 */
export function resolveEquipmentOwnershipContributions(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  options?: EquipmentOwnershipContributionsOptions,
): ReadonlyMap<string, readonly EquipmentOwnershipContribution[]> {
  const byEquipmentId = new Map<string, EquipmentOwnershipContribution[]>()

  appendPackageContributions(byEquipmentId, draft, catalogIndex)
  appendMagicChoiceContributions(byEquipmentId, draft, catalogIndex, options)
  appendPurchaseContributions(byEquipmentId, draft, catalogIndex, options)
  appendGrantContributions(byEquipmentId, draft, catalogIndex, options)

  return byEquipmentId
}

export function totalOwnershipContributionQuantity(
  contributions: readonly EquipmentOwnershipContribution[] | undefined,
): number {
  return (contributions ?? []).reduce((sum, contribution) => sum + contribution.quantity, 0)
}

/** Copies on the magic-item duplicate-policy axis: choices plus purchases. */
export function countAcquiredOwnershipQuantity(
  contributions: readonly EquipmentOwnershipContribution[] | undefined,
): number {
  return (contributions ?? []).reduce(
    (sum, contribution) =>
      contribution.kind === 'magic_choice' || contribution.kind === 'purchase'
        ? sum + contribution.quantity
        : sum,
    0,
  )
}
