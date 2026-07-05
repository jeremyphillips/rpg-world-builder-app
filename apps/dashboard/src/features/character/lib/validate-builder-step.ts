import {
  validateCharacterBuild,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuilderStepId,
  type CharacterBuildValidationIssue,
  type CharacterBuildValidationResult,
} from '@rpg/contracts'

export function validateBuilderStepSubmit(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  stepId: CharacterBuilderStepId,
): CharacterBuildValidationResult {
  return validateCharacterBuild(draft, context, 'stepSubmit', {
    stepId,
    resolvedChoiceSets: [],
  })
}

export function validateBuilderFinalSubmit(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
): CharacterBuildValidationResult {
  return validateCharacterBuild(draft, context, 'finalSubmit', {
    resolvedChoiceSets: [],
  })
}

export function issuesForStep(
  issues: CharacterBuildValidationIssue[],
  stepId: CharacterBuilderStepId,
): CharacterBuildValidationIssue[] {
  return issues.filter((issue) => issue.stepId === stepId)
}
