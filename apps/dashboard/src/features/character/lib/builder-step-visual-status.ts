import {
  BUILDER_STEP_READINESS_STEP_IDS,
  isBuilderStepComplete,
  resolveBuilderStepReadiness,
  type BuilderStepReadiness,
  type BuilderStepReadinessState,
  type BuilderStepReadinessStepId,
  type CharacterBuildCatalogIndex,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
  type CharacterBuilderStepId,
  type CharacterBuildValidationIssue,
  type ChoiceSet,
} from '@rpg/contracts'

import { issuesForStep } from './validate-builder-step'

export type StepStatus = 'notStarted' | 'current' | 'complete' | 'warning' | 'locked'

export type ResolveStepVisualStatusInput = {
  stepId: CharacterBuilderStepId
  draft: CharacterBuilderDraft
  currentStepId: CharacterBuilderStepId
  context: CharacterBuildContext
  resolvedChoiceSets: readonly ChoiceSet[] | null
  validationIssues: CharacterBuildValidationIssue[]
  draftValidationIssues: CharacterBuildValidationIssue[]
  attemptedStepIds: readonly CharacterBuilderStepId[]
  catalogIndex: CharacterBuildCatalogIndex
  standardArray: readonly number[]
}

const READINESS_STEP_IDS = new Set<CharacterBuilderStepId>(BUILDER_STEP_READINESS_STEP_IDS)

function isReadinessStep(stepId: CharacterBuilderStepId): stepId is BuilderStepReadinessStepId {
  return READINESS_STEP_IDS.has(stepId)
}

function stepStatusFromReadiness(
  readiness: BuilderStepReadiness,
  stepId: CharacterBuilderStepId,
  currentStepId: CharacterBuilderStepId,
): StepStatus | null {
  switch (readiness) {
    case 'notApplicable':
      return 'locked'
    case 'readyEmpty':
    case 'complete':
      return 'complete'
    case 'blocked':
      return currentStepId === stepId ? 'current' : 'notStarted'
    case 'readyWithChoices':
      return null
  }
}

function hasSubmitValidationWarning(
  stepId: CharacterBuilderStepId,
  validationIssues: CharacterBuildValidationIssue[],
  attemptedStepIds: readonly CharacterBuilderStepId[],
): boolean {
  return attemptedStepIds.includes(stepId) && issuesForStep(validationIssues, stepId).length > 0
}

function hasDraftValidationWarning(
  stepId: CharacterBuilderStepId,
  draft: CharacterBuilderDraft,
  draftValidationIssues: CharacterBuildValidationIssue[],
  attemptedStepIds: readonly CharacterBuilderStepId[],
): boolean {
  if (issuesForStep(draftValidationIssues, stepId).length === 0) {
    return false
  }

  return draft.touchedStepIds.includes(stepId) || attemptedStepIds.includes(stepId)
}

function hasDraftValidationIssues(
  stepId: CharacterBuilderStepId,
  draftValidationIssues: CharacterBuildValidationIssue[],
): boolean {
  return issuesForStep(draftValidationIssues, stepId).length > 0
}

function resolveReadinessState(
  stepId: CharacterBuilderStepId,
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  resolvedChoiceSets: readonly ChoiceSet[] | null,
): BuilderStepReadinessState | null {
  if (!isReadinessStep(stepId) || resolvedChoiceSets === null) {
    return null
  }

  return resolveBuilderStepReadiness(stepId, draft, context, resolvedChoiceSets)
}

function resolveReadinessVisualStatus(
  readiness: BuilderStepReadiness,
  stepId: CharacterBuilderStepId,
  currentStepId: CharacterBuilderStepId,
  draftValidationIssues: CharacterBuildValidationIssue[],
): StepStatus | null {
  const readinessStatus = stepStatusFromReadiness(readiness, stepId, currentStepId)
  if (readinessStatus === null) {
    return null
  }

  if (readinessStatus === 'complete' && hasDraftValidationIssues(stepId, draftValidationIssues)) {
    return currentStepId === stepId ? 'current' : 'notStarted'
  }

  return readinessStatus
}

function resolveIncompleteVisualStatus(
  stepId: CharacterBuilderStepId,
  draft: CharacterBuilderDraft,
  currentStepId: CharacterBuilderStepId,
  resolvedChoiceSets: readonly ChoiceSet[] | null,
  draftValidationIssues: CharacterBuildValidationIssue[],
  standardArray: readonly number[],
): StepStatus {
  const isComplete = isBuilderStepComplete(stepId, draft, resolvedChoiceSets, { standardArray })
  if (isComplete && !hasDraftValidationIssues(stepId, draftValidationIssues)) {
    return 'complete'
  }

  return currentStepId === stepId ? 'current' : 'notStarted'
}

export function resolveStepVisualStatus({
  stepId,
  draft,
  currentStepId,
  context,
  resolvedChoiceSets,
  validationIssues,
  draftValidationIssues,
  attemptedStepIds,
  catalogIndex: _catalogIndex,
  standardArray,
}: ResolveStepVisualStatusInput): StepStatus {
  const readinessState = resolveReadinessState(stepId, draft, context, resolvedChoiceSets)

  if (readinessState?.readiness === 'notApplicable') {
    return 'locked'
  }

  if (
    hasSubmitValidationWarning(stepId, validationIssues, attemptedStepIds) ||
    hasDraftValidationWarning(stepId, draft, draftValidationIssues, attemptedStepIds)
  ) {
    return 'warning'
  }

  if (readinessState) {
    const readinessStatus = resolveReadinessVisualStatus(
      readinessState.readiness,
      stepId,
      currentStepId,
      draftValidationIssues,
    )
    if (readinessStatus !== null) {
      return readinessStatus
    }
  }

  return resolveIncompleteVisualStatus(
    stepId,
    draft,
    currentStepId,
    resolvedChoiceSets,
    draftValidationIssues,
    standardArray,
  )
}

export const STEP_STATUS_ARIA_LABELS: Record<StepStatus, string> = {
  notStarted: 'not started',
  current: 'current step',
  complete: 'complete',
  warning: 'has validation issues',
  locked: 'not applicable',
}

export function stepStatusAriaLabel(stepLabel: string, status: StepStatus): string {
  return `${stepLabel}, ${STEP_STATUS_ARIA_LABELS[status]}`
}
