import { BUILDER_STEPS, type CharacterBuilderStepId } from '@rpg/contracts'

export const DEFAULT_BUILDER_STEP_ID = 'identity' satisfies CharacterBuilderStepId

export function resolveCurrentStepId(
  stepId: CharacterBuilderStepId | undefined,
): CharacterBuilderStepId {
  return stepId ?? DEFAULT_BUILDER_STEP_ID
}

export function getBuilderStepIndex(stepId: CharacterBuilderStepId): number {
  return BUILDER_STEPS.findIndex((step) => step.id === stepId)
}

export function getAdjacentBuilderStepId(
  stepId: CharacterBuilderStepId,
  direction: 'back' | 'forward',
): CharacterBuilderStepId | null {
  const index = getBuilderStepIndex(stepId)
  if (index < 0) return null

  const nextIndex = direction === 'back' ? index - 1 : index + 1
  return BUILDER_STEPS[nextIndex]?.id ?? null
}

export function isFirstBuilderStep(stepId: CharacterBuilderStepId): boolean {
  return getBuilderStepIndex(stepId) === 0
}

export function isReviewBuilderStep(stepId: CharacterBuilderStepId): boolean {
  return stepId === 'review'
}

export function appendTouchedStepId(
  touchedStepIds: readonly CharacterBuilderStepId[],
  stepId: CharacterBuilderStepId,
): CharacterBuilderStepId[] {
  return touchedStepIds.includes(stepId) ? [...touchedStepIds] : [...touchedStepIds, stepId]
}
