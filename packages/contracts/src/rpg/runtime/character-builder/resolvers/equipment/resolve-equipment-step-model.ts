import type { StartingWealthRules } from '../../../../campaign/rules/starting-wealth'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import { readSelectedStartingEquipmentOptionId } from './resolve-starting-equipment-choice-sets'
import {
  deriveEquipmentBudgetSummaryFromFunding,
  resolveStartingEquipmentFundingOptions,
  type ResolvedStartingEquipmentFunding,
} from './resolve-starting-equipment-funding'
import type { EquipmentBudgetSummary } from './equipment-budget'

export type EquipmentStepModel = {
  fundingByOptionId: ReadonlyMap<string, ResolvedStartingEquipmentFunding>
  selectedOptionId?: string
  currentFunding?: ResolvedStartingEquipmentFunding
  budget?: EquipmentBudgetSummary
}

/** Resolves equipment-step funding snapshots and the current shopping budget once. */
export function resolveEquipmentStepModel(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  startingWealth?: StartingWealthRules
  includeBudget?: boolean
}): EquipmentStepModel | undefined {
  const classId = args.draft.class.classId
  if (!classId) return undefined

  const fundingByOptionId = resolveStartingEquipmentFundingOptions({
    draft: args.draft,
    catalogIndex: args.catalogIndex,
    startingWealth: args.startingWealth,
  })

  if (fundingByOptionId.size === 0) return undefined

  const selectedOptionId = readSelectedStartingEquipmentOptionId(args.draft, classId)
  const currentFunding = selectedOptionId ? fundingByOptionId.get(selectedOptionId) : undefined

  const budget =
    args.includeBudget && currentFunding
      ? deriveEquipmentBudgetSummaryFromFunding({
          funding: currentFunding,
          purchases: args.draft.equipment?.purchases ?? [],
          catalogIndex: args.catalogIndex,
        })
      : undefined

  return {
    fundingByOptionId,
    selectedOptionId,
    currentFunding,
    budget,
  }
}
