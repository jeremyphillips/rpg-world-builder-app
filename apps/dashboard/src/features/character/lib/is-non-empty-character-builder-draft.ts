import type { CharacterBuilderDraft } from '@rpg/contracts'

import { narrativeFieldCount } from './narrative-preview'

/** True when the draft has any user-authored progress beyond the empty template. */
export function isNonEmptyCharacterBuilderDraft(draft: CharacterBuilderDraft): boolean {
  const { identity, species, class: classDraft, abilities } = draft

  return [
    Boolean(identity.name?.trim()),
    narrativeFieldCount(identity.narrative) > 0,
    Boolean(identity.imageKey),
    Boolean(identity.alignment),
    Boolean(species.speciesId),
    Boolean(species.heritageId),
    Boolean(classDraft.classId),
    Boolean(abilities.method),
    Object.keys(abilities.scores ?? {}).length > 0,
    Object.keys(draft.choiceSelections).length > 0,
    draft.touchedStepIds.length > 0,
    Boolean(draft.currentStepId),
  ].some(Boolean)
}
