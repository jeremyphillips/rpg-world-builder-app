import {
  createEmptyCharacterBuilderDraft,
  isClassProgressionApplicable,
  type CharacterBuilderDraft,
} from '@rpg/contracts'

import type { QuickNpcSetupValues } from './quick-npc-form-fields'

/** Seeds the full NPC builder from quick-create setup selections. */
export function buildCharacterBuilderDraftFromQuickNpcSetup(
  setup: QuickNpcSetupValues,
): CharacterBuilderDraft {
  const draft = createEmptyCharacterBuilderDraft()

  if (setup.speciesId) {
    draft.species.speciesId = setup.speciesId
  }

  draft.class.level = setup.level
  if (isClassProgressionApplicable(setup.level) && setup.classId) {
    draft.class.classId = setup.classId
  }

  draft.touchedStepIds = ['species', 'class']

  return draft
}
