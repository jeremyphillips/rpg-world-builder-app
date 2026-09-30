import { buildChoiceSetId, isChoiceSetSatisfied, type ChoiceSet } from '../choice-set'
import { indexCharacterBuildCatalog, type CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import { cloneEquipmentDraftChannel } from '../resolvers/equipment/equipment-draft-base'
import { startingEquipmentChoiceSetId } from '../resolvers/equipment/resolve-starting-equipment-choice-sets'
import { resolveAvailableChoices } from '../resolvers/registry/resolve-choices'
import type { NpcRecommendationSource } from '../sourced-recommendation'
import { getChoiceSetStepId } from '../steps'
import { validationIssue } from '../validate/issue'
import type { CharacterBuildValidationIssue } from '../validate/types'
import {
  automaticNpcConstraintFailureIssue,
  fillChoiceSetWithConstraintAwareSelection,
} from './automatic-npc-build-constraint-selection'
import {
  normalizeAutomaticNpcBuildConstraints,
  type AutomaticNpcBuildConstraints,
} from './automatic-npc-build-constraints'
import type { AutomaticNpcBuildPreferences } from './automatic-npc-build-seed'
import { resolveHeldProficiencyKeys } from './resolve-held-proficiency-keys'

/**
 * Safety guard against resolver bugs only — termination is progress-based
 * (every iteration adds selections, marks equipment skipped once, or fails).
 */
const AUTOMATIC_BUILD_ITERATION_CEILING = 64

/** choiceSetId → optionId → recommendation sources. Canonical picks are `[]`. */
export type AutomaticChoiceSuggestedBy = Record<
  string,
  Record<string, readonly NpcRecommendationSource[]>
>

export type ResolveAutomaticChoiceSelectionsArgs = {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  preferences?: AutomaticNpcBuildPreferences
  constraints?: AutomaticNpcBuildConstraints
  /**
   * ChoiceSets the caller already decided. The loop does not top them up,
   * even when the stored fill is shorter than `min`.
   */
  pinnedChoiceSetIds?: ReadonlySet<string>
}

export type AutomaticChoiceSelectionsSuccess = {
  ok: true
  draft: CharacterBuilderDraft
  resolvedChoiceSets: ChoiceSet[]
  suggestedBy: AutomaticChoiceSuggestedBy
}

export type AutomaticChoiceSelectionsFailure = {
  ok: false
  issues: CharacterBuildValidationIssue[]
}

export type AutomaticChoiceSelectionsResult =
  | AutomaticChoiceSelectionsSuccess
  | AutomaticChoiceSelectionsFailure

function isEquipmentSkipped(draft: CharacterBuilderDraft): boolean {
  return draft.equipment?.skipped === true
}

function findUnsatisfiedRequiredChoiceSet(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
  pinnedChoiceSetIds: ReadonlySet<string> | undefined,
): ChoiceSet | undefined {
  return choiceSets.find(
    (choiceSet) =>
      choiceSet.required &&
      !pinnedChoiceSetIds?.has(choiceSet.id) &&
      !(isEquipmentSkipped(draft) && getChoiceSetStepId(choiceSet) === 'equipment') &&
      !isChoiceSetSatisfied(choiceSet, draft.choiceSelections[choiceSet.id] ?? []),
  )
}

/**
 * Mirrors the builder's escape hatch: when the class's top-level starting
 * equipment ChoiceSet has no options, the build continues without starting
 * equipment (`equipment.skipped`) instead of failing.
 */
function isEmptyTopLevelStartingEquipmentChoiceSet(
  choiceSet: ChoiceSet,
  draft: CharacterBuilderDraft,
): boolean {
  return (
    choiceSet.options.length === 0 &&
    draft.class.classId !== undefined &&
    choiceSet.id === startingEquipmentChoiceSetId(draft.class.classId)
  )
}

function heritageChoiceSetIdFor(choiceSet: ChoiceSet): string {
  return buildChoiceSetId('species', choiceSet.sourceId, 'heritage')
}

function applyChoiceSetSelection(
  choiceSet: ChoiceSet,
  next: CharacterBuilderDraft,
): CharacterBuilderDraft {
  const selections = next.choiceSelections[choiceSet.id] ?? []

  // Heritage selections dual-write species.heritageId (mirrors the species step).
  if (choiceSet.sourceType === 'species' && choiceSet.id === heritageChoiceSetIdFor(choiceSet)) {
    return { ...next, species: { ...next.species, heritageId: selections[0] } }
  }

  return next
}

/**
 * Fills every required ChoiceSet on a draft. Magic-item grants and weapon
 * ensure-grants stay with `resolveAutomaticNpcBuild`.
 */
export function resolveAutomaticChoiceSelections({
  draft: inputDraft,
  context,
  preferences,
  constraints,
  pinnedChoiceSetIds,
}: ResolveAutomaticChoiceSelectionsArgs): AutomaticChoiceSelectionsResult {
  const normalizedConstraints = normalizeAutomaticNpcBuildConstraints(constraints)
  const catalogIndex = indexCharacterBuildCatalog(context.catalog)
  const suggestedBy: AutomaticChoiceSuggestedBy = {}
  let draft: CharacterBuilderDraft = {
    ...inputDraft,
    species: { ...inputDraft.species },
    choiceSelections: { ...inputDraft.choiceSelections },
  }

  for (let iteration = 0; iteration < AUTOMATIC_BUILD_ITERATION_CEILING; iteration += 1) {
    const choiceSets = resolveAvailableChoices(draft, context)
    const target = findUnsatisfiedRequiredChoiceSet(draft, choiceSets, pinnedChoiceSetIds)

    if (!target) {
      return {
        ok: true,
        draft,
        resolvedChoiceSets: choiceSets,
        suggestedBy,
      }
    }

    if (isEmptyTopLevelStartingEquipmentChoiceSet(target, draft)) {
      draft = { ...draft, equipment: cloneEquipmentDraftChannel(draft, { skipped: true }) }
      continue
    }

    const characterClass =
      target.sourceType === 'class' ? catalogIndex.classes.get(target.sourceId) : undefined
    const filled = fillChoiceSetWithConstraintAwareSelection({
      draft,
      choiceSet: target,
      constraints: normalizedConstraints,
      preferences,
      heldKeys: resolveHeldProficiencyKeys(draft, context, choiceSets, {
        excludeChoiceSetId: target.id,
      }),
      characterClass,
      catalogIndex,
    })
    if (filled === null) {
      return {
        ok: false,
        issues: [automaticNpcConstraintFailureIssue(normalizedConstraints, target, catalogIndex)],
      }
    }

    suggestedBy[target.id] = filled.suggestedBy
    draft = applyChoiceSetSelection(target, filled.draft)
  }

  return {
    ok: false,
    issues: [
      validationIssue(
        'automatic_resolution_stalled',
        characterBuilderValidationMessages.automaticResolutionStalled(),
      ),
    ],
  }
}
