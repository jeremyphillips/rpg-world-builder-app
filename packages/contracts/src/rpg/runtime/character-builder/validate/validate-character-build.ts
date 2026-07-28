import { characterBuilderValidationMessages } from '../messages/character-builder-messages'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft'
import type { CharacterBuildEngineOptions } from '../engine-options'
import type { CharacterBuilderStepId } from '../../../character-builder/step-ids'
import { BUILDER_STEPS, isChoiceStep } from '../steps'

import { validationIssue } from './issue'
import type {
  CharacterBuildValidationIssue,
  CharacterBuildValidationPhase,
  CharacterBuildValidationResult,
} from './types'
import { validateChoiceSetsForStep } from './validate-choice-sets'
import { validateEquipment } from './validate-equipment'
import {
  validateAbilities,
  validateClass,
  validateIdentity,
  validateSpecies,
} from './validate-step-fields'

const STEP_VALIDATORS: Record<
  CharacterBuilderStepId,
  (
    draft: CharacterBuilderDraft,
    context: CharacterBuildContext,
    choiceSets: readonly ChoiceSet[],
  ) => CharacterBuildValidationIssue[]
> = {
  identity: (draft, _context, _choiceSets) => validateIdentity(draft, false),
  species: (draft, context, choiceSets) => [
    ...validateSpecies(draft),
    ...validateChoiceSetsForStep(draft, context, choiceSets, 'species'),
  ],
  class: (draft, context) => validateClass(draft, context),
  abilities: (draft, context) =>
    validateAbilities(draft, context.characterCreationRules.abilityGeneration.standardArray),
  proficiencies: (draft, context, choiceSets) =>
    validateChoiceSetsForStep(draft, context, choiceSets, 'proficiencies'),
  equipment: (draft, context, choiceSets) => [
    ...validateChoiceSetsForStep(draft, context, choiceSets, 'equipment'),
    ...validateEquipment(draft, context),
  ],
  spells: (draft, context, choiceSets) =>
    validateChoiceSetsForStep(draft, context, choiceSets, 'spells'),
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
          validationIssue('step_id_required', characterBuilderValidationMessages.stepIncomplete(), {
            path: 'stepId',
          }),
        ],
      }
    }

    if (!shouldValidateChoiceStep(stepId, options.resolvedChoiceSets)) {
      return {
        ok: false,
        issues: [
          validationIssue(
            'choice_sets_loading',
            characterBuilderValidationMessages.choiceSetsLoading(),
            { stepId },
          ),
        ],
      }
    }

    const issues = STEP_VALIDATORS[stepId](draft, context, choiceSets)
    return { ok: issues.length === 0, issues }
  }

  const issues = validateAllSteps(draft, context, choiceSets, true)
  return { ok: issues.length === 0, issues }
}
