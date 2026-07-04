import type { ChoiceSet } from './choice-set'
import type { CharacterBuilderStepId } from './step-ids'

// ---------------------------------------------------------------------------
// Shared options for preview, validation, and finalization.
// ---------------------------------------------------------------------------

export type CharacterBuildEngineOptions = {
  /**
   * ChoiceSets from `resolveAvailableChoices` (BENCH-087). Pass `null` before
   * resolvers run — MVP-A defers choice-dependent steps. Pass `[]` when
   * resolvers ran but found no ChoiceSets for the current draft.
   */
  resolvedChoiceSets?: readonly ChoiceSet[] | null
  /** Required when `phase` is `stepSubmit`. */
  stepId?: CharacterBuilderStepId
}
