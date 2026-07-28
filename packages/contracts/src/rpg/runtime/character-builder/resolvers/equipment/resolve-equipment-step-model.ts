import type { StartingWealthRules } from '../../../../campaign/rules/starting-wealth'
import type { ChoiceSet } from '../../choice-set'
import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../../context'
import type { CharacterBuilderDraft } from '../../draft'
import type { EquipmentStepUnavailableReason } from '../../equipment-step-unavailable'
import type { BuilderStepReadinessState } from '../../step-readiness'
import { readSelectedStartingEquipmentOptionId } from './resolve-starting-equipment-choice-sets'
import {
  deriveEquipmentBudgetSummaryFromFunding,
  resolveStartingEquipmentFundingOptions,
  type ResolvedStartingEquipmentFunding,
} from './resolve-starting-equipment-funding'
import type { EquipmentBudgetSummary } from './equipment-budget'
import { resolveEquipmentStepReadiness } from './resolve-equipment-step-readiness'

export type EquipmentStepModel = {
  readiness: BuilderStepReadinessState
  fundingByOptionId: ReadonlyMap<string, ResolvedStartingEquipmentFunding>
  selectedOptionId?: string
  currentFunding?: ResolvedStartingEquipmentFunding
  budget?: EquipmentBudgetSummary
}

export type ResolveEquipmentStepModelResult =
  | { status: 'available'; model: EquipmentStepModel }
  | { status: 'unavailable'; reason: EquipmentStepUnavailableReason }

function resolveEquipmentStepUnavailableReason(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  resolvedChoiceSets: readonly ChoiceSet[] | null
  fundingByOptionId: ReadonlyMap<string, ResolvedStartingEquipmentFunding>
  selectedOptionId?: string
}): EquipmentStepUnavailableReason | undefined {
  if (args.resolvedChoiceSets === null) return 'choice_sets_loading'

  const classId = args.draft.class.classId
  if (!classId) return 'class_missing'

  if (!args.catalogIndex.classes.get(classId)) return 'class_not_in_catalog'
  if (args.fundingByOptionId.size === 0) return 'funding_context_missing'

  if (args.selectedOptionId && !args.fundingByOptionId.get(args.selectedOptionId)) {
    return 'funding_context_missing'
  }

  return undefined
}

/** Resolves equipment-step funding snapshots, readiness, and the current shopping budget once. */
export function resolveEquipmentStepModel(args: {
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  context: CharacterBuildContext
  resolvedChoiceSets: readonly ChoiceSet[] | null
  startingWealth?: StartingWealthRules
  includeBudget?: boolean
}): ResolveEquipmentStepModelResult {
  const classId = args.draft.class.classId
  const fundingByOptionId = classId
    ? resolveStartingEquipmentFundingOptions({
        draft: args.draft,
        catalogIndex: args.catalogIndex,
        startingWealth: args.startingWealth,
      })
    : new Map<string, ResolvedStartingEquipmentFunding>()

  const selectedOptionId = classId
    ? readSelectedStartingEquipmentOptionId(args.draft, classId)
    : undefined

  const unavailableReason = resolveEquipmentStepUnavailableReason({
    draft: args.draft,
    catalogIndex: args.catalogIndex,
    resolvedChoiceSets: args.resolvedChoiceSets,
    fundingByOptionId,
    selectedOptionId,
  })

  if (unavailableReason) {
    return { status: 'unavailable', reason: unavailableReason }
  }

  const currentFunding = selectedOptionId ? fundingByOptionId.get(selectedOptionId) : undefined

  const budget =
    args.includeBudget && currentFunding
      ? deriveEquipmentBudgetSummaryFromFunding({
          funding: currentFunding,
          purchases: args.draft.equipment?.purchases ?? [],
          catalogIndex: args.catalogIndex,
        })
      : undefined

  const readiness = resolveEquipmentStepReadiness(
    args.draft,
    args.resolvedChoiceSets ?? [],
    args.context,
  )

  return {
    status: 'available',
    model: {
      readiness,
      fundingByOptionId,
      selectedOptionId,
      currentFunding,
      budget,
    },
  }
}
