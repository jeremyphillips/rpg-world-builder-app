import {
  BUILDER_STEP_READINESS_STEP_IDS,
  isBuilderStepComplete,
  resolveBuilderStepReadiness,
  type BuilderStepReadiness,
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

export function resolveStepVisualStatus({
  stepId,
  draft,
  currentStepId,
  context,
  resolvedChoiceSets,
  validationIssues,
  attemptedStepIds,
  catalogIndex: _catalogIndex,
  standardArray,
}: ResolveStepVisualStatusInput): StepStatus {
  const hasBlockingIssues = issuesForStep(validationIssues, stepId).length > 0
  const hasAttemptedStep = attemptedStepIds.includes(stepId)
  if (hasAttemptedStep && hasBlockingIssues) {
    return 'warning'
  }

  if (isReadinessStep(stepId) && resolvedChoiceSets !== null) {
    const readiness = resolveBuilderStepReadiness(stepId, draft, context, resolvedChoiceSets)
    const readinessStatus = stepStatusFromReadiness(readiness.readiness, stepId, currentStepId)
    if (readinessStatus !== null) {
      return readinessStatus
    }
  }

  const isComplete = isBuilderStepComplete(stepId, draft, resolvedChoiceSets, { standardArray })
  if (isComplete) {
    return 'complete'
  }

  const isActive = currentStepId === stepId
  if (isActive) {
    return 'current'
  }

  return 'notStarted'
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
