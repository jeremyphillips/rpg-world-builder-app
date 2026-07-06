import type { CharacterBuilderDraft } from '@rpg/contracts'

/** Returns updated `choiceSelections` for a single ChoiceSet id. */
export function withChoiceSetSelections(
  draft: CharacterBuilderDraft,
  choiceSetId: string,
  selections: string[],
): CharacterBuilderDraft['choiceSelections'] {
  return {
    ...draft.choiceSelections,
    [choiceSetId]: selections,
  }
}
