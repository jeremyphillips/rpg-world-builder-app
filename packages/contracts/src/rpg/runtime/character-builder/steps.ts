import { ABILITY_IDS } from '../../vocab/ability'
import { areRequiredChoiceSetsSatisfied } from './choice-set'
import type { ChoiceSet, ChoiceType } from './choice-set'
import type { CharacterBuilderDraft } from './draft'
import type { CharacterBuilderStepId } from './step-ids'

// ---------------------------------------------------------------------------
// BuilderStepStatus — the computed display state of a wizard step.
// ---------------------------------------------------------------------------

export type BuilderStepStatus =
  /** All required fields/choices for this step are set. */
  | 'complete'
  /** The step is currently open/focused (`draft.currentStepId` matches). */
  | 'active'
  /** Visited or upcoming but not yet fully filled. */
  | 'incomplete'
  /**
   * Choice-dependent step (proficiencies, equipment, spells) where
   * `resolvedChoiceSets` has not been provided (null). Used in MVP-A before
   * choice resolvers are implemented — the shell renders these steps as
   * stubbed placeholders.
   */
  | 'deferred'

// ---------------------------------------------------------------------------
// BuilderStep — static display metadata for rail rendering and navigation.
// ---------------------------------------------------------------------------

export type BuilderStep = {
  id: CharacterBuilderStepId
  /** Short label shown in the step rail. */
  label: string
  /** One-line description shown under the label or in tooltips. */
  description: string
}

export const BUILDER_STEPS: readonly BuilderStep[] = [
  {
    id: 'identity',
    label: 'Identity',
    description: 'Name, appearance, and alignment',
  },
  {
    id: 'species',
    label: 'Species',
    description: "Choose your character's species and heritage",
  },
  {
    id: 'class',
    label: 'Class',
    description: "Choose your character's class",
  },
  {
    id: 'abilities',
    label: 'Abilities',
    description: 'Assign your six ability scores',
  },
  {
    id: 'proficiencies',
    label: 'Proficiencies',
    description: 'Choose skill and other proficiencies',
  },
  {
    id: 'equipment',
    label: 'Equipment',
    description: 'Choose your starting equipment',
  },
  {
    id: 'spells',
    label: 'Spells',
    description: 'Choose your starting spells',
  },
  {
    id: 'review',
    label: 'Review',
    description: 'Review and finalize your character',
  },
]

// ---------------------------------------------------------------------------
// Step → ChoiceType mapping
//
// Determines which ChoiceSets belong to each step, enabling
// getBuilderStepStatus to filter and check the right ChoiceSets.
// Species: heritage trait picks (choiceType 'trait').
// Proficiencies: any proficiency-category choices from class or species grants.
// Equipment: starting equipment package picks.
// Spells: cantrip and known/prepared spell picks.
// ---------------------------------------------------------------------------

const STEP_CHOICE_TYPES: Partial<Record<CharacterBuilderStepId, ReadonlySet<ChoiceType>>> = {
  species: new Set<ChoiceType>(['trait']),
  proficiencies: new Set<ChoiceType>([
    'skillProficiency',
    'weaponProficiency',
    'toolProficiency',
    'armorTraining',
    'language',
  ]),
  equipment: new Set<ChoiceType>(['equipment']),
  spells: new Set<ChoiceType>(['cantrip', 'spell']),
}

function getChoiceSetsForStep(
  stepId: CharacterBuilderStepId,
  choiceSets: readonly ChoiceSet[],
): ChoiceSet[] {
  const types = STEP_CHOICE_TYPES[stepId]
  if (!types) return []
  return choiceSets.filter((cs) => types.has(cs.choiceType))
}

// ---------------------------------------------------------------------------
// Per-step completion predicates — draft-content checks only.
// Full rule-based validation (validate.ts, BENCH-080) is the second pass.
// ---------------------------------------------------------------------------

function isIdentityComplete(draft: CharacterBuilderDraft): boolean {
  return typeof draft.identity.name === 'string' && draft.identity.name.trim().length > 0
}

function isSpeciesComplete(
  draft: CharacterBuilderDraft,
  stepChoiceSets: readonly ChoiceSet[],
): boolean {
  if (!draft.species.speciesId) return false
  return areRequiredChoiceSetsSatisfied(stepChoiceSets, draft.choiceSelections)
}

function isClassComplete(draft: CharacterBuilderDraft): boolean {
  return typeof draft.class.classId === 'string' && draft.class.classId.length > 0
}

function isAbilitiesComplete(draft: CharacterBuilderDraft): boolean {
  if (!draft.abilities.method) return false
  const scores = draft.abilities.scores
  if (!scores) return false
  return ABILITY_IDS.every((ability) => typeof scores[ability] === 'number')
}

function isChoiceStepComplete(
  draft: CharacterBuilderDraft,
  stepChoiceSets: readonly ChoiceSet[],
): boolean {
  return areRequiredChoiceSetsSatisfied(stepChoiceSets, draft.choiceSelections)
}

function isReviewComplete(
  draft: CharacterBuilderDraft,
  resolvedChoiceSets: readonly ChoiceSet[] | null,
): boolean {
  const prerequisiteIds = BUILDER_STEPS.filter((s) => s.id !== 'review').map((s) => s.id)
  return prerequisiteIds.every((id) => {
    const status = getBuilderStepStatus(id, draft, resolvedChoiceSets)
    return status === 'complete' || status === 'deferred'
  })
}

// ---------------------------------------------------------------------------
// Completion dispatch table — one predicate per step.
// Eliminates the switch statement from getBuilderStepStatus, keeping it below
// the cyclomatic threshold.
// ---------------------------------------------------------------------------

type StepCompletionArgs = [
  draft: CharacterBuilderDraft,
  stepChoiceSets: ChoiceSet[],
  resolvedChoiceSets: readonly ChoiceSet[] | null,
]

const STEP_COMPLETION_CHECKS: Record<
  CharacterBuilderStepId,
  (...args: StepCompletionArgs) => boolean
> = {
  identity: (draft) => isIdentityComplete(draft),
  species: (draft, stepChoiceSets) => isSpeciesComplete(draft, stepChoiceSets),
  class: (draft) => isClassComplete(draft),
  abilities: (draft) => isAbilitiesComplete(draft),
  proficiencies: (draft, stepChoiceSets) => isChoiceStepComplete(draft, stepChoiceSets),
  equipment: (draft, stepChoiceSets) => isChoiceStepComplete(draft, stepChoiceSets),
  spells: (draft, stepChoiceSets) => isChoiceStepComplete(draft, stepChoiceSets),
  review: (draft, _stepChoiceSets, resolvedChoiceSets) =>
    isReviewComplete(draft, resolvedChoiceSets),
}

// ---------------------------------------------------------------------------
// getBuilderStepStatus — the single entry point for step status computation.
// ---------------------------------------------------------------------------

/**
 * Computes the display status of a builder step.
 *
 * @param stepId             - The step to evaluate.
 * @param draft              - The current draft state.
 * @param resolvedChoiceSets - All ChoiceSets resolved for the current draft.
 *
 *   Pass `null`  → resolvers have not run yet. Choice-dependent steps
 *                  (proficiencies, equipment, spells) return `'deferred'`.
 *
 *   Pass `[]`    → resolvers ran but found no ChoiceSets for this step
 *                  (e.g. a class with only fixed-grant equipment). The step is
 *                  treated as complete — no choices are needed.
 *
 *   Pass a non-empty array → resolvers ran; required ChoiceSets are checked
 *                  against `draft.choiceSelections`.
 */
export function getBuilderStepStatus(
  stepId: CharacterBuilderStepId,
  draft: CharacterBuilderDraft,
  resolvedChoiceSets: readonly ChoiceSet[] | null,
): BuilderStepStatus {
  if (draft.currentStepId === stepId) return 'active'

  const isChoiceStep = stepId in STEP_CHOICE_TYPES
  if (isChoiceStep && resolvedChoiceSets === null) return 'deferred'

  const stepChoiceSets =
    resolvedChoiceSets !== null ? getChoiceSetsForStep(stepId, resolvedChoiceSets) : []

  return STEP_COMPLETION_CHECKS[stepId](draft, stepChoiceSets, resolvedChoiceSets)
    ? 'complete'
    : 'incomplete'
}
