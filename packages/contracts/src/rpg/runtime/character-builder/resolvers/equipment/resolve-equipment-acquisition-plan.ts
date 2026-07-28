import type { Equipment } from '../../../../content/equipment'
import { resolveStartingWealthTierForBuilder } from '../../../../campaign/rules/starting-wealth'
import type { CharacterBuilderDraft } from '../../draft/draft'
import { getBuilderSelectedStartingLevel } from '../../progression/builder-level'
import { deriveEquipmentBudgetSummary } from './equipment-budget'
import type {
  EquipmentAcquisitionBlocker,
  EquipmentAcquisitionBuilderContext,
  EquipmentAcquisitionPlan,
} from './equipment-acquisition-types'
import { allocateMagicItemGrantQuantity } from './allocate-magic-item-grants'
import { resolveAffordablePurchaseRemainder } from './resolve-affordable-purchase-remainder'
import { resolveMagicItemGrantAllowances } from './resolve-magic-item-grant-allowances'
import {
  matchingAllowancesForRarity,
  readMagicItemSelections,
  resolveMagicItemGrantProgressList,
  wouldViolateDuplicatePolicy,
} from './resolve-magic-item-grant-progress'
import {
  finalizeAcquisitionPlan,
  fulfilledAcquisitionPlan,
  resolvePurchaseOnlyPlan,
} from './resolve-equipment-acquisition-plan-helpers'

function resolveActiveAllowances(
  draft: CharacterBuilderDraft,
  context: EquipmentAcquisitionBuilderContext,
) {
  const startingLevel = getBuilderSelectedStartingLevel(draft)
  const tier = resolveStartingWealthTierForBuilder(context.startingWealth, startingLevel)
  if (!tier) return []

  return resolveMagicItemGrantAllowances({
    startingWealthTableId: context.startingWealthTableId,
    tier,
  })
}

function duplicateBlockedPlan(
  requestedQuantity: number,
  equipment: Equipment,
): EquipmentAcquisitionPlan {
  return finalizeAcquisitionPlan({
    requestedQuantity,
    grantAllocations: [],
    purchaseQuantity: 0,
    equipment,
    blockers: [{ code: 'duplicate_not_allowed' }],
  })
}

/** Magic-item acquisition planner — grant capacity first, then purchase remainder. */
export function resolveEquipmentAcquisitionPlan(args: {
  draft: CharacterBuilderDraft
  context: EquipmentAcquisitionBuilderContext
  equipment: Equipment
  requestedQuantity: number
}): EquipmentAcquisitionPlan {
  const { draft, context, equipment, requestedQuantity } = args

  if (requestedQuantity < 1) {
    return fulfilledAcquisitionPlan(requestedQuantity)
  }

  const selections = readMagicItemSelections(draft)
  const purchases = draft.equipment?.purchases ?? []
  const budget = deriveEquipmentBudgetSummary(draft, context.catalogIndex, {
    startingWealth: context.startingWealth,
  })

  if (
    wouldViolateDuplicatePolicy({
      equipment,
      equipmentId: equipment.id,
      selections,
      purchases,
      additionalQuantity: requestedQuantity,
    })
  ) {
    return duplicateBlockedPlan(requestedQuantity, equipment)
  }

  if (equipment.kind !== 'magic_item' || !equipment.rarity) {
    return resolvePurchaseOnlyPlan({
      equipment,
      requestedQuantity,
      budget,
      selections,
      purchases,
    })
  }

  const allowances = resolveActiveAllowances(draft, context)
  const matchingAllowances = matchingAllowancesForRarity(allowances, equipment.rarity)
  const progress = resolveMagicItemGrantProgressList({ allowances, selections })
  const grantResult = allocateMagicItemGrantQuantity({
    requestedQuantity,
    matchingAllowances,
    progress,
  })

  const blockers: EquipmentAcquisitionBlocker[] = grantResult.missingGrant
    ? [{ code: 'no_matching_grant' }]
    : []

  const purchaseResult = resolveAffordablePurchaseRemainder({
    equipment,
    budget,
    remainingQuantity: grantResult.remainingQuantity,
  })

  return finalizeAcquisitionPlan({
    requestedQuantity,
    grantAllocations: grantResult.grantAllocations,
    purchaseQuantity: purchaseResult.purchaseQuantity,
    equipment,
    blockers: [...blockers, ...purchaseResult.blockers],
  })
}

/** Purchase-only planner — never allocates grants. */
export function resolveEquipmentPurchasePlan(args: {
  draft: CharacterBuilderDraft
  context: EquipmentAcquisitionBuilderContext
  equipment: Equipment
  requestedQuantity: number
}): EquipmentAcquisitionPlan {
  const { draft, context, equipment, requestedQuantity } = args

  return resolvePurchaseOnlyPlan({
    equipment,
    requestedQuantity,
    budget: deriveEquipmentBudgetSummary(draft, context.catalogIndex, {
      startingWealth: context.startingWealth,
    }),
    selections: readMagicItemSelections(draft),
    purchases: draft.equipment?.purchases ?? [],
  })
}
