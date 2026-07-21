import type { CharacterBuildContext } from './context'
import type { CharacterBuilderDraft } from './draft'
import { resolveAvailableChoices } from './resolvers/registry/resolve-choices'

export type BuilderSelectionRemovalReason = 'choice_set_unavailable' | 'option_not_in_choice_set'

export type BuilderSelectionRemoval = {
  choiceSetId: string
  removedOptionIds: string[]
  reason: BuilderSelectionRemovalReason
  label?: string
}

export type PruneInvalidBuilderSelectionsResult = {
  nextDraft: CharacterBuilderDraft
  removedSelections: BuilderSelectionRemoval[]
}

/**
 * Evaluates a complete candidate draft against the current choice-set graph.
 * Does not apply patches — callers supply the post-change draft.
 */
export function pruneInvalidBuilderSelections(
  candidateDraft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): PruneInvalidBuilderSelectionsResult {
  const choiceSets = resolveAvailableChoices(candidateDraft, context)
  const validChoiceSetIds = new Set(choiceSets.map((choiceSet) => choiceSet.id))
  const validOptionsByChoiceSetId = new Map(
    choiceSets.map((choiceSet) => [
      choiceSet.id,
      new Set(choiceSet.options.map((option) => option.id)),
    ]),
  )

  const removedSelections: BuilderSelectionRemoval[] = []
  const nextChoiceSelections: CharacterBuilderDraft['choiceSelections'] = {}

  for (const [choiceSetId, selectedIds] of Object.entries(candidateDraft.choiceSelections)) {
    if (!validChoiceSetIds.has(choiceSetId)) {
      if (selectedIds.length > 0) {
        removedSelections.push({
          choiceSetId,
          removedOptionIds: [...selectedIds],
          reason: 'choice_set_unavailable',
        })
      }
      continue
    }

    const allowedOptionIds = validOptionsByChoiceSetId.get(choiceSetId)!
    const keptOptionIds = selectedIds.filter((optionId) => allowedOptionIds.has(optionId))
    const removedOptionIds = selectedIds.filter((optionId) => !allowedOptionIds.has(optionId))

    if (keptOptionIds.length > 0) {
      nextChoiceSelections[choiceSetId] = keptOptionIds
    }

    if (removedOptionIds.length > 0) {
      removedSelections.push({
        choiceSetId,
        removedOptionIds,
        reason: 'option_not_in_choice_set',
      })
    }
  }

  return {
    nextDraft: {
      ...candidateDraft,
      choiceSelections: nextChoiceSelections,
    },
    removedSelections,
  }
}
