import type { CharacterBuilderDraft } from '@rpg/contracts'

export function mergeCharacterBuilderDraft(
  draft: CharacterBuilderDraft,
  patch: Partial<CharacterBuilderDraft>,
): CharacterBuilderDraft {
  return {
    ...draft,
    ...patch,
    identity: patch.identity ? { ...draft.identity, ...patch.identity } : draft.identity,
    species: patch.species ? { ...draft.species, ...patch.species } : draft.species,
    class: patch.class ? { ...draft.class, ...patch.class } : draft.class,
    abilities: patch.abilities ? { ...draft.abilities, ...patch.abilities } : draft.abilities,
    choiceSelections: patch.choiceSelections ?? draft.choiceSelections,
    touchedStepIds: patch.touchedStepIds ?? draft.touchedStepIds,
  }
}
