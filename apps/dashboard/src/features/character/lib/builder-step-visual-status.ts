import {
  getBuilderStepStatus,
  isSpellcastingActiveAtLevel,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterBuilderStepId,
  type CharacterBuildValidationIssue,
} from '@rpg/contracts'

import { issuesForStep } from './validate-builder-step'

export type StepStatus = 'notStarted' | 'inProgress' | 'complete' | 'warning' | 'locked'

export type ResolveStepVisualStatusInput = {
  stepId: CharacterBuilderStepId
  draft: CharacterBuilderDraft
  currentStepId: CharacterBuilderStepId
  resolvedChoiceSets: null
  validationIssues: CharacterBuildValidationIssue[]
  catalogIndex: CharacterBuildCatalogIndex
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
  catalogIndex,
}: ResolveStepVisualStatusInput): StepStatus {
  if (stepId === 'spells' && isSpellsStepLocked(draft, catalogIndex)) {
    return 'locked'
  }

  const builderStatus = getBuilderStepStatus(stepId, draft, resolvedChoiceSets)
  const isActive = currentStepId === stepId
  const isTouched = draft.touchedStepIds.includes(stepId)
  const hasAttemptedIssues = issuesForStep(validationIssues, stepId).length > 0

  if (hasAttemptedIssues && (isTouched || isActive)) {
    return 'warning'
  }

  if (builderStatus === 'complete') {
    return 'complete'
  }

  if (isActive || isTouched) {
    return 'inProgress'
  }

  return 'notStarted'
}

export function stepStatusAriaLabel(
  stepLabel: string,
  status: StepStatus,
  isActive: boolean,
): string {
  const statusLabels: Record<StepStatus, string> = {
    notStarted: 'not started',
    inProgress: isActive ? 'current step' : 'in progress',
    complete: 'complete',
    warning: 'has validation issues',
    locked: 'locked',
  }

  return `${stepLabel}, ${statusLabels[status]}`
}
