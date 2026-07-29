import { ABILITY_IDS } from '../../vocab/ability'
import {
  getContentTypeCapitalizedSentenceLabel,
  getContentTypeSentenceForm,
  getContentTypeTerm,
} from '../../content/lib/content-type-terms'
import { isStandardArrayAssignment, STANDARD_ARRAY } from './ability/ability-generation'
import { areRequiredChoiceSetsSatisfied } from './choice-set'
import type { ChoiceSet, ChoiceType } from './choice-set'
import type { CharacterBuildContext } from './context'
import { getCharacterBuilderChromeMessages } from './messages/character-builder-chrome-messages'
import { resolveCharacterBuilderChromeVariant } from './character-builder-chrome-variant'
import type { CharacterBuilderDraft } from './draft/draft'
import { resolveAvailableContent } from './preview/resolve-available-content'
import {
  CHARACTER_BUILDER_STEP_IDS,
  type CharacterBuilderStepId,
} from '../../character-builder/step-ids'

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

type BuilderStepMeta = {
  readonly label: string
  readonly description: string
  /**
   * When true, the step stays `deferred` until resolvers supply ChoiceSets.
   * Species is excluded — primary species selection is always available in the shell.
   */
  readonly deferredUntilChoiceSetsResolved?: true
  readonly isApplicable?: (context: CharacterBuildContext, draft: CharacterBuilderDraft) => boolean
}

const BUILDER_STEP_METADATA = {
  identity: {
    label: 'Identity',
    description: 'Name, appearance, and alignment',
  },
  connections: {
    label: 'Connections',
    description: 'Choose organizations connected to your character',
    isApplicable: (context, draft) =>
      draft.connections.organizations.length > 0 ||
      resolveAvailableContent(context).organizations.length > 0,
  },
  species: {
    label: getContentTypeTerm('species').label,
    description: `Choose your character's ${getContentTypeSentenceForm('species')} and heritage`,
  },
  class: {
    label: getContentTypeTerm('classes').label,
    description: `Choose your character's ${getContentTypeSentenceForm('classes')}`,
  },
  abilities: {
    label: 'Abilities',
    description: 'Assign your six ability scores',
  },
  proficiencies: {
    label: 'Proficiencies',
    description: 'Choose skill and other proficiencies',
    deferredUntilChoiceSetsResolved: true,
  },
  equipment: {
    label: getContentTypeTerm('equipment').label,
    description: `Choose your starting ${getContentTypeSentenceForm('equipment')}`,
    deferredUntilChoiceSetsResolved: true,
  },
  spells: {
    label: getContentTypeCapitalizedSentenceLabel('spells', { plural: true }),
    description: `Choose your starting ${getContentTypeSentenceForm('spells', 2)}`,
    deferredUntilChoiceSetsResolved: true,
  },
  review: {
    label: 'Review',
    description: 'Review and finalize your character',
  },
} as const satisfies Record<CharacterBuilderStepId, BuilderStepMeta>

/** Ordered wizard steps — ids and order come from {@link CHARACTER_BUILDER_STEP_IDS}. */
export const BUILDER_STEPS: readonly BuilderStep[] = CHARACTER_BUILDER_STEP_IDS.map((id) => ({
  id,
  label: BUILDER_STEP_METADATA[id].label,
  description: BUILDER_STEP_METADATA[id].description,
}))

/** Registered steps filtered to those applicable to the current build and draft. */
export function resolveEffectiveBuilderSteps(
  context: CharacterBuildContext,
  draft: CharacterBuilderDraft,
): readonly BuilderStep[] {
  return BUILDER_STEPS.filter((step) => {
    const metadata = BUILDER_STEP_METADATA[step.id]
    const applicability = 'isApplicable' in metadata ? metadata.isApplicable : undefined
    return applicability ? applicability(context, draft) : true
  })
}

/** Short label for a wizard step (rail, review summaries, etc.). */
export function getBuilderStepLabel(stepId: CharacterBuilderStepId): string {
  return BUILDER_STEP_METADATA[stepId].label
}

/** Default step description from static metadata (context-agnostic). */
export function getBuilderStepDescription(stepId: CharacterBuilderStepId): string {
  return BUILDER_STEP_METADATA[stepId].description
}

/**
 * Context-aware step description for the builder rail.
 * Review step copy varies by chrome variant; other steps use static metadata.
 */
export function resolveBuilderStepDescription(
  context: CharacterBuildContext,
  stepId: CharacterBuilderStepId,
): string {
  if (stepId === 'review') {
    const variant = resolveCharacterBuilderChromeVariant(context)
    return getCharacterBuilderChromeMessages(variant).reviewStepDescription
  }

  return BUILDER_STEP_METADATA[stepId].description
}

// ---------------------------------------------------------------------------
// Step → ChoiceType mapping
//
// `CHOICE_TYPE_STEP` is the single source of truth; `STEP_CHOICE_TYPES` is the
// inverted index for step-scoped ChoiceSet filtering.
// ---------------------------------------------------------------------------

export const CHOICE_TYPE_STEP = {
  trait: 'species',
  feat: 'proficiencies',
  skillProficiency: 'proficiencies',
  weaponProficiency: 'proficiencies',
  toolProficiency: 'proficiencies',
  armorTraining: 'proficiencies',
  language: 'proficiencies',
  equipment: 'equipment',
  cantrip: 'spells',
  spell: 'spells',
} as const satisfies Record<ChoiceType, CharacterBuilderStepId>

function invertChoiceTypeStep(
  mapping: Record<ChoiceType, CharacterBuilderStepId>,
): Partial<Record<CharacterBuilderStepId, ReadonlySet<ChoiceType>>> {
  const byStep = new Map<CharacterBuilderStepId, Set<ChoiceType>>()

  for (const choiceType of Object.keys(mapping) as ChoiceType[]) {
    const stepId = mapping[choiceType]
    const types = byStep.get(stepId) ?? new Set<ChoiceType>()
    types.add(choiceType)
    byStep.set(stepId, types)
  }

  return Object.fromEntries(byStep) as Partial<
    Record<CharacterBuilderStepId, ReadonlySet<ChoiceType>>
  >
}

const STEP_CHOICE_TYPES = invertChoiceTypeStep(CHOICE_TYPE_STEP)

const DEFERRED_UNTIL_CHOICE_SETS_RESOLVED = new Set(
  CHARACTER_BUILDER_STEP_IDS.filter(
    (id) => 'deferredUntilChoiceSetsResolved' in BUILDER_STEP_METADATA[id],
  ),
)

/** Inverted index of {@link CHOICE_TYPE_STEP} — choice types grouped by step id. */
export const STEP_CHOICE_TYPES_BY_STEP = STEP_CHOICE_TYPES

/** Step ids that collect ChoiceSet selections (excludes identity, class, abilities, review). */
export const CHOICE_STEP_IDS = [
  ...new Set(Object.values(CHOICE_TYPE_STEP)),
] as const satisfies readonly CharacterBuilderStepId[]

export function isChoiceStep(stepId: CharacterBuilderStepId): boolean {
  return stepId in STEP_CHOICE_TYPES
}

/** Routes a ChoiceSet to the wizard step that owns its choice type. */
export function getChoiceSetStepId(choiceSet: ChoiceSet): CharacterBuilderStepId {
  return CHOICE_TYPE_STEP[choiceSet.choiceType]
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

function isConnectionsComplete(draft: CharacterBuilderDraft): boolean {
  const selectedIds = draft.connections.organizations.map(({ organizationId }) => organizationId)
  return new Set(selectedIds).size === selectedIds.length
}

function isAbilitiesComplete(
  draft: CharacterBuilderDraft,
  standardArray: readonly number[] = STANDARD_ARRAY,
): boolean {
  if (!draft.abilities.method) return false
  const scores = draft.abilities.scores
  if (!scores) return false
  if (!ABILITY_IDS.every((ability) => typeof scores[ability] === 'number')) return false

  if (draft.abilities.method === 'standard-array') {
    return isStandardArrayAssignment(scores, standardArray)
  }

  return true
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
  standardArray: readonly number[],
]

const STEP_COMPLETION_CHECKS: Record<
  CharacterBuilderStepId,
  (...args: StepCompletionArgs) => boolean
> = {
  identity: (draft) => isIdentityComplete(draft),
  connections: (draft) => isConnectionsComplete(draft),
  species: (draft, stepChoiceSets) => isSpeciesComplete(draft, stepChoiceSets),
  class: (draft) => isClassComplete(draft),
  abilities: (draft, _stepChoiceSets, _resolvedChoiceSets, standardArray) =>
    isAbilitiesComplete(draft, standardArray),
  proficiencies: (draft, stepChoiceSets) => isChoiceStepComplete(draft, stepChoiceSets),
  equipment: (draft, stepChoiceSets) =>
    draft.equipment?.skipped === true || isChoiceStepComplete(draft, stepChoiceSets),
  spells: (draft, stepChoiceSets) => isChoiceStepComplete(draft, stepChoiceSets),
  review: (draft, _stepChoiceSets, resolvedChoiceSets) =>
    isReviewComplete(draft, resolvedChoiceSets),
}

// ---------------------------------------------------------------------------
// getBuilderStepStatus — the single entry point for step status computation.
// ---------------------------------------------------------------------------

export type GetBuilderStepStatusOptions = {
  /** Standard array values for abilities-step multiset completion. Defaults to SRD. */
  standardArray?: readonly number[]
}

/**
 * Whether a step's required draft content is satisfied, ignoring navigation
 * position (`draft.currentStepId`). Use for rail icons and other cases where
 * "complete" must persist while revisiting an active step.
 */
export function isBuilderStepComplete(
  stepId: CharacterBuilderStepId,
  draft: CharacterBuilderDraft,
  resolvedChoiceSets: readonly ChoiceSet[] | null,
  options?: GetBuilderStepStatusOptions,
): boolean {
  if (DEFERRED_UNTIL_CHOICE_SETS_RESOLVED.has(stepId) && resolvedChoiceSets === null) {
    return false
  }

  const stepChoiceSets =
    resolvedChoiceSets !== null ? getChoiceSetsForStep(stepId, resolvedChoiceSets) : []
  const standardArray = options?.standardArray ?? STANDARD_ARRAY

  return STEP_COMPLETION_CHECKS[stepId](draft, stepChoiceSets, resolvedChoiceSets, standardArray)
}

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
 *                  (e.g. a class with only granted starting equipment). The step is
 *                  treated as complete — no choices are needed.
 *
 *   Pass a non-empty array → resolvers ran; required ChoiceSets are checked
 *                  against `draft.choiceSelections`.
 */
export function getBuilderStepStatus(
  stepId: CharacterBuilderStepId,
  draft: CharacterBuilderDraft,
  resolvedChoiceSets: readonly ChoiceSet[] | null,
  options?: GetBuilderStepStatusOptions,
): BuilderStepStatus {
  if (draft.currentStepId === stepId) return 'active'

  if (DEFERRED_UNTIL_CHOICE_SETS_RESOLVED.has(stepId) && resolvedChoiceSets === null) {
    return 'deferred'
  }

  return isBuilderStepComplete(stepId, draft, resolvedChoiceSets, options)
    ? 'complete'
    : 'incomplete'
}
