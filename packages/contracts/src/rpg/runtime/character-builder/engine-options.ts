import type { ChoiceSet } from './choice-set'
import type { CharacterBuilderStepId } from '../../character-builder/step-ids'

// ---------------------------------------------------------------------------
// Shared options for preview, validation, and finalization.
// ---------------------------------------------------------------------------

export type CharacterBuildEngineOptions = {
  /**
   * ChoiceSets from {@link resolveAvailableChoices}. Pass `null` before
   * resolvers run — MVP-A defers choice-dependent steps. Pass `[]` when
   * resolvers ran but found no ChoiceSets for the current draft.
   */
  resolvedChoiceSets?: readonly ChoiceSet[] | null
  /** Required when `phase` is `stepSubmit`. */
  stepId?: CharacterBuilderStepId
}
