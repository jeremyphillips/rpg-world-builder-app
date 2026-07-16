import type { ChoiceSet } from './choice-set'
import type { CharacterBuildContext } from './context'
import type { CharacterBuilderDraft } from './draft'
import { resolveEquipmentStepReadiness } from './resolvers/equipment/resolve-equipment-step-readiness'
import { resolveProficienciesStepReadiness } from './resolvers/proficiency/resolve-proficiencies-step-readiness'
import { resolveSpellsStepReadiness } from './resolvers/spellcasting/resolve-spells-step-readiness'
import {
  BUILDER_STEP_READINESS_STEP_IDS,
  type BuilderStepReadinessStepId,
} from './step-readiness-helpers'

// ---------------------------------------------------------------------------
// BuilderStepReadiness — derived empty/default state for advanced builder steps.
// Guides step-body rendering and rail affordances; does not replace validation.
// ---------------------------------------------------------------------------

export { BUILDER_STEP_READINESS_STEP_IDS, type BuilderStepReadinessStepId }
export {
  formatProficiencyChoiceEmptyMessage,
  formatStepReadinessMessage,
} from './step-readiness-helpers'

export type BuilderStepReadiness =
  | 'blocked'
  | 'notApplicable'
  | 'readyEmpty'
  | 'readyWithChoices'
  | 'complete'

export type BuilderStepReadinessState = {
  readiness: BuilderStepReadiness
  /** Primary user-facing state line. */
  message?: string
  /** Optional secondary line below the primary message. */
  helperText?: string
  /**
   * Proficiencies step only: class-dependent sections are blocked while
   * origin-language choices remain available.
   */
  classDependentBlocked?: boolean
}

export function resolveBuilderStepReadiness(
  stepId: BuilderStepReadinessStepId,
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  resolvedChoiceSets: readonly ChoiceSet[],
): BuilderStepReadinessState {
  switch (stepId) {
    case 'equipment':
      return resolveEquipmentStepReadiness(draft, resolvedChoiceSets, context)
    case 'spells':
      return resolveSpellsStepReadiness(draft, context, resolvedChoiceSets)
    case 'proficiencies':
      return resolveProficienciesStepReadiness(draft, resolvedChoiceSets)
  }
}

export { resolveSpellStepApplicability } from './resolvers/spellcasting/resolve-spell-step-applicability'
