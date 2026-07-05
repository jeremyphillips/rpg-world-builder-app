import {
  getBuilderStepStatus,
  isSpellcastingActiveAtLevel,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterBuilderStepId,
  type CharacterBuildValidationIssue,
} from '@rpg/contracts'

import { issuesForStep } from './validate-builder-step'

export type StepStatus = 'notStarted' | 'current' | 'complete' | 'warning' | 'locked'

export type ResolveStepVisualStatusInput = {
  stepId: CharacterBuilderStepId
  draft: CharacterBuilderDraft
  currentStepId: CharacterBuilderStepId
  resolvedChoiceSets: null
  validationIssues: CharacterBuildValidationIssue[]
  attemptedStepIds: readonly CharacterBuilderStepId[]
  catalogIndex: CharacterBuildCatalogIndex
  standardArray: readonly number[]
}

function isSpellsStepLocked(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
): boolean {
  const classId = draft.class.classId
  if (!classId) return false

  const characterClass = catalogIndex.classes.get(classId)
  if (!characterClass) return false

  return !isSpellcastingActiveAtLevel(characterClass.spellcasting, draft.class.level)
}

export function resolveStepVisualStatus({
  stepId,
  draft,
  currentStepId,
  resolvedChoiceSets,
  validationIssues,
  attemptedStepIds,
  catalogIndex,
  standardArray,
}: ResolveStepVisualStatusInput): StepStatus {
  if (stepId === 'spells' && isSpellsStepLocked(draft, catalogIndex)) {
    return 'locked'
  }

  const hasBlockingIssues = issuesForStep(validationIssues, stepId).length > 0
  const hasAttemptedStep = attemptedStepIds.includes(stepId)

  if (hasAttemptedStep && hasBlockingIssues) {
    return 'warning'
  }

  const builderStatus = getBuilderStepStatus(stepId, draft, resolvedChoiceSets, {
    standardArray,
  })
  if (builderStatus === 'complete') {
    return 'complete'
  }

  if (currentStepId === stepId) {
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
