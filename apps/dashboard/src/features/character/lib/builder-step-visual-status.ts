import {
  isBuilderStepComplete,
  resolveSpellcastingProfile,
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

function isSpellsStepLocked(draft: CharacterBuilderDraft, context: CharacterBuildContext): boolean {
  if (!draft.class.classId) return false
  return resolveSpellcastingProfile(draft, context) === null
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
  const isLocked = stepId === 'spells' && isSpellsStepLocked(draft, context)
  if (isLocked) {
    return 'locked'
  }

  const hasBlockingIssues = issuesForStep(validationIssues, stepId).length > 0
  const hasAttemptedStep = attemptedStepIds.includes(stepId)
  if (hasAttemptedStep && hasBlockingIssues) {
    return 'warning'
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

export function stepStatusAriaLabel(stepLabel: string, status: StepStatus): string {
  const statusLabels: Record<StepStatus, string> = {
    notStarted: 'not started',
    current: 'current step',
    complete: 'complete',
    warning: 'has validation issues',
    locked: 'locked',
  }

  return `${stepLabel}, ${statusLabels[status]}`
}
