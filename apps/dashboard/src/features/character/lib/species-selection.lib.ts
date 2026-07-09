import type { CharacterBuilderDraft } from '@rpg/contracts'

import { withChoiceSetSelections } from './choice-set-selections'

/** Removes all species-scoped choice selections from the draft map. */
export function clearSpeciesScopedChoiceSelections(
  choiceSelections: CharacterBuilderDraft['choiceSelections'],
): CharacterBuilderDraft['choiceSelections'] {
  return Object.fromEntries(
    Object.entries(choiceSelections).filter(([choiceSetId]) => !choiceSetId.startsWith('species:')),
  )
}

/**
 * Patch for changing the selected species. Clears heritage and all `species:`
 * choice selections to prevent stale dependent choices after a species swap.
 */
export function buildSpeciesSelectionPatch(
  draft: CharacterBuilderDraft,
  nextSpeciesId: string | undefined,
): Partial<CharacterBuilderDraft> {
  return {
    species: {
      ...draft.species,
      speciesId: nextSpeciesId || undefined,
      heritageId: undefined,
    },
    choiceSelections: clearSpeciesScopedChoiceSelections(draft.choiceSelections),
  }
}

/** Patch for selecting a heritage option; syncs choiceSelections and heritageId. */
export function buildHeritageSelectionPatch(
  draft: CharacterBuilderDraft,
  choiceSetId: string,
  optionId: string,
): Partial<CharacterBuilderDraft> {
  return {
    choiceSelections: withChoiceSetSelections(draft, choiceSetId, [optionId]),
    species: {
      ...draft.species,
      heritageId: optionId,
    },
  }
}
