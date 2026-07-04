import { ABILITY_IDS, ABILITY_SCORE_MIN, CHARACTER_ABILITY_SCORE_MAX } from '../../vocab/ability'
import { abilityValidationMessages } from '../../vocab/ability-messages'
import { formatFieldMessage } from '../../../validation/define-message'
import type { CharacterBuilderStepId } from './step-ids'
import { isStandardArrayAssignment } from './ability-generation'
import { characterBuilderValidationMessages } from './character-builder-messages'
import { isChoiceSetSatisfied } from './choice-set'
import type { ChoiceSet } from './choice-set'
import type { CharacterBuildContext } from './context'
import type { CharacterBuilderDraft } from './draft'
import type { CharacterBuildEngineOptions } from './engine-options'
import { BUILDER_STEPS, getChoiceSetStepId, isChoiceStep } from './steps'

// ---------------------------------------------------------------------------
// Character build validation — three phases over draft + context.
// ---------------------------------------------------------------------------

export const CHARACTER_BUILD_VALIDATION_PHASES = ['draft', 'stepSubmit', 'finalSubmit'] as const

export type CharacterBuildValidationPhase = (typeof CHARACTER_BUILD_VALIDATION_PHASES)[number]

export type CharacterBuildValidationIssue = {
  code: string
  message: string
  path?: string
  stepId?: CharacterBuilderStepId
  choiceSetId?: string
}

export type CharacterBuildValidationResult = {
  ok: boolean
  issues: CharacterBuildValidationIssue[]
}

function issue(
  code: string,
  message: string,
  extra: Omit<CharacterBuildValidationIssue, 'code' | 'message'> = {},
): CharacterBuildValidationIssue {
  return { code, message, ...extra }
}

function validateIdentity(
  draft: CharacterBuilderDraft,
  requireAlignment: boolean,
): CharacterBuildValidationIssue[] {
  const issues: CharacterBuildValidationIssue[] = []

  if (!draft.identity.name?.trim()) {
    issues.push(
      issue('name_required', characterBuilderValidationMessages.nameRequired(), {
        path: 'identity.name',
        stepId: 'identity',
      }),
    )
  }

  if (requireAlignment && !draft.identity.alignment) {
    issues.push(
      issue('alignment_required', characterBuilderValidationMessages.alignmentRequired(), {
        path: 'identity.alignment',
        stepId: 'identity',
      }),
    )
  }

  return issues
}

function validateSpecies(draft: CharacterBuilderDraft): CharacterBuildValidationIssue[] {
  if (draft.species.speciesId) return []

  return [
    issue('species_required', characterBuilderValidationMessages.speciesRequired(), {
      path: 'species.speciesId',
      stepId: 'species',
    }),
  ]
}

function validateClass(draft: CharacterBuilderDraft): CharacterBuildValidationIssue[] {
  if (draft.class.classId) return []

  return [
    issue('class_required', characterBuilderValidationMessages.classRequired(), {
      path: 'class.classId',
      stepId: 'class',
    }),
  ]
}

function validateAbilities(
  draft: CharacterBuilderDraft,
  standardArray: readonly number[],
): CharacterBuildValidationIssue[] {
  const issues: CharacterBuildValidationIssue[] = []

  if (!draft.abilities.method) {
    issues.push(
      issue('ability_method_required', characterBuilderValidationMessages.abilityMethodRequired(), {
        path: 'abilities.method',
        stepId: 'abilities',
      }),
    )
    return issues
  }

  const scores = draft.abilities.scores
  if (!scores || !ABILITY_IDS.every((ability) => typeof scores[ability] === 'number')) {
    issues.push(
      issue('abilities_incomplete', characterBuilderValidationMessages.abilitiesIncomplete(), {
        path: 'abilities.scores',
        stepId: 'abilities',
      }),
    )
    return issues
  }

  for (const ability of ABILITY_IDS) {
    const score = scores[ability]!
    if (score < ABILITY_SCORE_MIN || score > CHARACTER_ABILITY_SCORE_MAX) {
      issues.push(
        issue(
          'ability_score_out_of_range',
          formatFieldMessage(
            abilityValidationMessages.characterScoreOutOfRange({
              min: ABILITY_SCORE_MIN,
              max: CHARACTER_ABILITY_SCORE_MAX,
            }),
          ),
          { path: `abilities.scores.${ability}`, stepId: 'abilities' },
        ),
      )
    }
  }

  if (
    draft.abilities.method === 'standard-array' &&
    !isStandardArrayAssignment(scores, standardArray)
  ) {
    issues.push(
      issue(
        'standard_array_exact_assignment',
        characterBuilderValidationMessages.standardArrayExactAssignment(),
        { path: 'abilities.scores', stepId: 'abilities' },
      ),
    )
  }

  return issues
}

function validateChoiceSets(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
): CharacterBuildValidationIssue[] {
  const issues: CharacterBuildValidationIssue[] = []

  for (const choiceSet of choiceSets) {
    const selections = draft.choiceSelections[choiceSet.id] ?? []
    const stepId = getChoiceSetStepId(choiceSet)

    if (choiceSet.required && !isChoiceSetSatisfied(choiceSet, selections)) {
      issues.push(
        issue(
          'choice_set_unsatisfied',
          characterBuilderValidationMessages.choiceSetUnsatisfied({
            label: choiceSet.label,
            min: choiceSet.min,
          }),
          { stepId, choiceSetId: choiceSet.id },
        ),
      )
    }

    if (selections.length > choiceSet.max) {
      issues.push(
        issue(
          'choice_set_too_many',
          characterBuilderValidationMessages.choiceSetTooMany({
            label: choiceSet.label,
            max: choiceSet.max,
          }),
          { stepId, choiceSetId: choiceSet.id },
        ),
      )
    }
  }

  return issues
}

const STEP_VALIDATORS: Record<
  CharacterBuilderStepId,
  (
    draft: CharacterBuilderDraft,
    context: CharacterBuildContext,
    choiceSets: readonly ChoiceSet[],
  ) => CharacterBuildValidationIssue[]
> = {
  identity: (draft, _context, _choiceSets) => validateIdentity(draft, false),
  species: (draft, _context, choiceSets) => [
    ...validateSpecies(draft),
    ...validateChoiceSets(
      draft,
      choiceSets.filter((choiceSet) => getChoiceSetStepId(choiceSet) === 'species'),
    ),
  ],
  class: (draft) => validateClass(draft),
  abilities: (draft, context) =>
    validateAbilities(draft, context.characterCreationRules.abilityGeneration.standardArray),
  proficiencies: (draft, _context, choiceSets) =>
    validateChoiceSets(
      draft,
      choiceSets.filter((choiceSet) => getChoiceSetStepId(choiceSet) === 'proficiencies'),
    ),
  equipment: (draft, _context, choiceSets) =>
    validateChoiceSets(
      draft,
      choiceSets.filter((choiceSet) => getChoiceSetStepId(choiceSet) === 'equipment'),
    ),
  spells: (draft, _context, choiceSets) =>
    validateChoiceSets(
      draft,
      choiceSets.filter((choiceSet) => getChoiceSetStepId(choiceSet) === 'spells'),
    ),
  review: () => [],
}

function validateAllSteps(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  choiceSets: readonly ChoiceSet[],
  requireAlignment: boolean,
): CharacterBuildValidationIssue[] {
  const stepIssues = BUILDER_STEPS.flatMap((step) =>
    STEP_VALIDATORS[step.id](draft, context, choiceSets),
  )

  if (requireAlignment) {
    return [
      ...stepIssues,
      ...validateIdentity(draft, true).filter((entry) => entry.code === 'alignment_required'),
    ]
  }

  return stepIssues
}

function shouldValidateChoiceStep(
  stepId: CharacterBuilderStepId,
  resolvedChoiceSets: readonly ChoiceSet[] | null | undefined,
): boolean {
  if (!isChoiceStep(stepId)) return true
  return resolvedChoiceSets !== null && resolvedChoiceSets !== undefined
}

/**
 * Validates a character builder draft.
 *
 * - `draft` — soft warnings for rail badges and preview (all issues, non-blocking).
 * - `stepSubmit` — blocks Continue for `options.stepId` only.
 * - `finalSubmit` — full pass required before finalization.
 */
export function validateCharacterBuild(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  phase: CharacterBuildValidationPhase,
  options: CharacterBuildEngineOptions = {},
): CharacterBuildValidationResult {
  const choiceSets = options.resolvedChoiceSets ?? []

  if (phase === 'draft') {
    const issues = validateAllSteps(draft, context, choiceSets, false)
    return { ok: true, issues }
  }

  if (phase === 'stepSubmit') {
    const stepId = options.stepId
    if (!stepId) {
      return {
        ok: false,
        issues: [
          issue('step_id_required', characterBuilderValidationMessages.stepIncomplete(), {
            path: 'stepId',
          }),
        ],
      }
    }

    if (!shouldValidateChoiceStep(stepId, options.resolvedChoiceSets)) {
      return { ok: true, issues: [] }
    }

    const issues = STEP_VALIDATORS[stepId](draft, context, choiceSets)
    return { ok: issues.length === 0, issues }
  }

  const issues = validateAllSteps(draft, context, choiceSets, true)
  return { ok: issues.length === 0, issues }
}
