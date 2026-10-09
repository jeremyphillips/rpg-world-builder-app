import {
  countAcquiredOwnershipQuantity,
  resolveEquipmentOwnershipContributions,
  totalOwnershipContributionQuantity,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type EquipmentBudgetSummary,
  type EquipmentOwnershipContribution,
  type EquipmentOwnershipContributionsOptions,
  type MagicItemAllowanceRequirement,
  type MagicItemRarity,
} from '@rpg/contracts'

export type EquipmentOwnershipChoice = {
  allowanceId: string
  rarity: MagicItemRarity
  requirement: MagicItemAllowanceRequirement
  quantity: number
}

export type EquipmentOwnershipPurchaseTotals = {
  quantity: number
  spendCp: number
}

/**
 * Per-item ownership view over `EquipmentOwnershipContribution[]`. Every total is
 * derived from `contributions` — this never reads another draft channel.
 */
export type EquipmentOwnership = {
  contributions: readonly EquipmentOwnershipContribution[]
  totalQuantity: number
  packageQuantity: number
  grantQuantity: number
  /** The aggregate the purchase stepper owns. */
  editablePurchased: EquipmentOwnershipPurchaseTotals
  /** Conversion or manual rows the stepper must not touch. */
  lockedPurchased: EquipmentOwnershipPurchaseTotals
  choices: readonly EquipmentOwnershipChoice[]
  /** Copies on the magic-item duplicate-policy axis: choices plus purchases. */
  acquiredQuantity: number
}

export type EquipmentPickerOwnershipIndex = ReadonlyMap<string, EquipmentOwnership>

export const EMPTY_EQUIPMENT_OWNERSHIP: EquipmentOwnership = {
  contributions: [],
  totalQuantity: 0,
  packageQuantity: 0,
  grantQuantity: 0,
  editablePurchased: { quantity: 0, spendCp: 0 },
  lockedPurchased: { quantity: 0, spendCp: 0 },
  choices: [],
  acquiredQuantity: 0,
}

function addPurchase(
  totals: EquipmentOwnershipPurchaseTotals,
  contribution: Extract<EquipmentOwnershipContribution, { kind: 'purchase' }>,
): void {
  totals.quantity += contribution.quantity
  totals.spendCp += (contribution.unitCostCp ?? 0) * contribution.quantity
}

function summarizeContributions(
  contributions: readonly EquipmentOwnershipContribution[],
): EquipmentOwnership {
  const editablePurchased: EquipmentOwnershipPurchaseTotals = { quantity: 0, spendCp: 0 }
  const lockedPurchased: EquipmentOwnershipPurchaseTotals = { quantity: 0, spendCp: 0 }
  const choices: EquipmentOwnershipChoice[] = []
  let packageQuantity = 0
  let grantQuantity = 0

  for (const contribution of contributions) {
    switch (contribution.kind) {
      case 'package':
        packageQuantity += contribution.quantity
        break
      case 'grant':
        grantQuantity += contribution.quantity
        break
      case 'magic_choice':
        choices.push({
          allowanceId: contribution.allowanceId,
          rarity: contribution.rarity,
          requirement: contribution.requirement,
          quantity: contribution.quantity,
        })
        break
      case 'purchase':
        addPurchase(contribution.editable ? editablePurchased : lockedPurchased, contribution)
        break
    }
  }

  return {
    contributions,
    totalQuantity: totalOwnershipContributionQuantity(contributions),
    packageQuantity,
    grantQuantity,
    editablePurchased,
    lockedPurchased,
    choices,
    acquiredQuantity: countAcquiredOwnershipQuantity(contributions),
  }
}

/** One pass per draft — the single ownership source the picker reads. */
export function buildEquipmentPickerOwnershipIndex(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  budget?: EquipmentBudgetSummary
  options?: Omit<EquipmentOwnershipContributionsOptions, 'budget'>
}): EquipmentPickerOwnershipIndex {
  const contributions = resolveEquipmentOwnershipContributions(args.draft, args.catalogIndex, {
    ...args.options,
    budget: args.budget,
  })

  const index = new Map<string, EquipmentOwnership>()
  for (const [equipmentId, entries] of contributions) {
    index.set(equipmentId, summarizeContributions(entries))
  }
  return index
}

export function getEquipmentOwnership(
  index: EquipmentPickerOwnershipIndex | undefined,
  equipmentId: string,
): EquipmentOwnership {
  return index?.get(equipmentId) ?? EMPTY_EQUIPMENT_OWNERSHIP
}
