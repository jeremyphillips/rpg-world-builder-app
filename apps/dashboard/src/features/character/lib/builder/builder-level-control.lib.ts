import {
  characterBuilderLevelMessages,
  formatFieldMessage,
  sanitizeClassForLevel,
  type BuilderLevelConstraints,
  type BuilderSelectionRemoval,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type ChoiceSet,
  pruneInvalidBuilderSelections,
} from '@rpg/contracts'
import type { SelectFieldOption } from '@rpg/ui'

import { mergeCharacterBuilderDraft } from '../draft/merge-character-builder-draft'

export function buildBuilderLevelSelectOptions(
  constraints: BuilderLevelConstraints,
): SelectFieldOption[] {
  const options: SelectFieldOption[] = []

  for (let level = constraints.minLevel; level <= constraints.maxLevel; level++) {
    const disabled = constraints.allowedLevels ? !constraints.allowedLevels.includes(level) : false

    options.push({
      value: String(level),
      label: String(level),
      disabled,
    })
  }

  return options
}

export function resolveBuilderLevelHelperText(constraints: BuilderLevelConstraints): string {
  if (constraints.mode === 'fixed' && constraints.fixedLevel !== undefined) {
    return formatFieldMessage(
      characterBuilderLevelMessages.fixedHelper({ startingLevel: constraints.fixedLevel }),
    )
  }

  return formatFieldMessage(
    characterBuilderLevelMessages.selectableHelper({ maxLevel: constraints.maxLevel }),
  )
}

export type BuilderLevelChangeEvaluation =
  | { kind: 'unchanged' }
  | { kind: 'apply'; nextDraft: CharacterBuilderDraft }
  | {
      kind: 'confirm'
      level: number
      nextDraft: CharacterBuilderDraft
      removedSelections: BuilderSelectionRemoval[]
    }

export function evaluateBuilderLevelChange(
  draft: CharacterBuilderDraft,
  level: number,
  context: CharacterBuildContext,
): BuilderLevelChangeEvaluation {
  if (level === draft.class.level) {
    return { kind: 'unchanged' }
  }

  const candidateDraft = sanitizeClassForLevel(
    mergeCharacterBuilderDraft(draft, {
      class: { ...draft.class, level },
    }),
  )
  const { nextDraft, removedSelections } = pruneInvalidBuilderSelections(candidateDraft, context)

  if (removedSelections.length === 0) {
    return { kind: 'apply', nextDraft }
  }

  return { kind: 'confirm', level, nextDraft, removedSelections }
}

export function summarizeBuilderLevelRemovals(
  removedSelections: readonly BuilderSelectionRemoval[],
  choiceSets: readonly ChoiceSet[],
): string[] {
  const labelByChoiceSetId = new Map(choiceSets.map((choiceSet) => [choiceSet.id, choiceSet.label]))

  return removedSelections.map((removal) => {
    const label = labelByChoiceSetId.get(removal.choiceSetId) ?? removal.choiceSetId
    return formatFieldMessage(
      characterBuilderLevelMessages.removalSummary({
        label,
        count: removal.removedOptionIds.length,
      }),
    )
  })
}
