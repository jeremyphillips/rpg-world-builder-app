import {
  validateCharacterBuild,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuildValidationResult,
  type ChoiceSet,
} from '@rpg/contracts'
import type {
  CharacterBuilderStepId,
  CharacterBuildValidationIssue,
} from '@rpg/contracts/rpg/character-builder'

export function validateBuilderStepSubmit(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  stepId: CharacterBuilderStepId,
  resolvedChoiceSets: readonly ChoiceSet[],
): CharacterBuildValidationResult {
  return validateCharacterBuild(draft, context, 'stepSubmit', {
    stepId,
    resolvedChoiceSets,
  })
}

export function validateBuilderFinalSubmit(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  resolvedChoiceSets: readonly ChoiceSet[],
): CharacterBuildValidationResult {
  return validateCharacterBuild(draft, context, 'finalSubmit', {
    resolvedChoiceSets,
  })
}

export function validateBuilderDraft(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  resolvedChoiceSets: readonly ChoiceSet[],
): CharacterBuildValidationResult {
  return validateCharacterBuild(draft, context, 'draft', {
    resolvedChoiceSets,
  })
}

export function resolveBuilderDraftValidationIssues(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  resolvedChoiceSets: readonly ChoiceSet[],
): CharacterBuildValidationIssue[] {
  return validateBuilderDraft(draft, context, resolvedChoiceSets).issues
}

export function issuesForStep(
  issues: CharacterBuildValidationIssue[],
  stepId: CharacterBuilderStepId,
): CharacterBuildValidationIssue[] {
  return issues.filter((issue) => issue.stepId === stepId)
}

/** Replaces a step's issues after draft edits while validation is visible for that step. */
export function resolveStepValidationIssuesAfterDraftChange(
  issues: readonly CharacterBuildValidationIssue[],
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  stepId: CharacterBuilderStepId,
  resolvedChoiceSets: readonly ChoiceSet[],
): CharacterBuildValidationIssue[] {
  const remainingIssues = issues.filter((issue) => issue.stepId !== stepId)
  const result = validateBuilderStepSubmit(draft, context, stepId, resolvedChoiceSets)
  return result.ok ? remainingIssues : [...remainingIssues, ...result.issues]
}
