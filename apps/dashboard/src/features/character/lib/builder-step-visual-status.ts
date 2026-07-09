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

export type StepStatus = 'idle' | 'active' | 'complete' | 'error' | 'locked'

export type ResolveStepVisualStatusInput = {
  stepId: CharacterBuilderStepId
  draft: CharacterBuilderDraft
  currentStepId: CharacterBuilderStepId
  context: CharacterBuildContext
  resolvedChoiceSets: readonly ChoiceSet[] | null
  draftValidationIssues: CharacterBuildValidationIssue[]
  validationVisibleStepIds: readonly CharacterBuilderStepId[]
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
      return currentStepId === stepId ? 'active' : 'idle'
    case 'readyWithChoices':
      return null
  }
}

function hasValidationVisibleError(
  stepId: CharacterBuilderStepId,
  validationVisibleStepIds: readonly CharacterBuilderStepId[],
): boolean {
  return validationVisibleStepIds.includes(stepId)
}

function hasDraftValidationIssues(
  stepId: CharacterBuilderStepId,
  draftValidationIssues: CharacterBuildValidationIssue[],
): boolean {
  return draftValidationIssues.some((issue) => issue.stepId === stepId)
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
    return currentStepId === stepId ? 'active' : 'idle'
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

  return currentStepId === stepId ? 'active' : 'idle'
}

export function resolveStepVisualStatus({
  stepId,
  draft,
  currentStepId,
  context,
  resolvedChoiceSets,
  draftValidationIssues,
  validationVisibleStepIds,
  catalogIndex: _catalogIndex,
  standardArray,
}: ResolveStepVisualStatusInput): StepStatus {
  const readinessState = resolveReadinessState(stepId, draft, context, resolvedChoiceSets)

  if (readinessState?.readiness === 'notApplicable') {
    return 'locked'
  }

  if (hasValidationVisibleError(stepId, validationVisibleStepIds)) {
    return 'error'
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
  idle: 'not started',
  active: 'current step',
  complete: 'complete',
  error: 'has blocking validation issues',
  locked: 'not applicable',
}

export function stepStatusAriaLabel(stepLabel: string, status: StepStatus): string {
  return `${stepLabel}, ${STEP_STATUS_ARIA_LABELS[status]}`
}
