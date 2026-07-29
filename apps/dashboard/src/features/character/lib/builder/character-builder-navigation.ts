import { BUILDER_STEPS, type BuilderStep } from '@rpg/contracts'
import type { CharacterBuilderStepId } from '@rpg/contracts/rpg/character-builder'

export const DEFAULT_BUILDER_STEP_ID = 'identity' satisfies CharacterBuilderStepId

export function resolveCurrentStepId(
  stepId: CharacterBuilderStepId | undefined,
): CharacterBuilderStepId {
  return stepId ?? DEFAULT_BUILDER_STEP_ID
}

export function getBuilderStepIndex(
  stepId: CharacterBuilderStepId,
  steps: readonly BuilderStep[] = BUILDER_STEPS,
): number {
  return steps.findIndex((step) => step.id === stepId)
}

export function getAdjacentBuilderStepId(
  stepId: CharacterBuilderStepId,
  direction: 'back' | 'forward',
  steps: readonly BuilderStep[] = BUILDER_STEPS,
): CharacterBuilderStepId | null {
  const index = getBuilderStepIndex(stepId, steps)
  if (index < 0) return null

  const nextIndex = direction === 'back' ? index - 1 : index + 1
  return steps[nextIndex]?.id ?? null
}

export function isFirstBuilderStep(
  stepId: CharacterBuilderStepId,
  steps: readonly BuilderStep[] = BUILDER_STEPS,
): boolean {
  return getBuilderStepIndex(stepId, steps) === 0
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

export function appendAttemptedStepId(
  attemptedStepIds: readonly CharacterBuilderStepId[],
  stepId: CharacterBuilderStepId,
): CharacterBuilderStepId[] {
  return attemptedStepIds.includes(stepId) ? [...attemptedStepIds] : [...attemptedStepIds, stepId]
}

export function mergeAttemptedStepIds(
  attemptedStepIds: readonly CharacterBuilderStepId[],
  stepIds: readonly CharacterBuilderStepId[],
): CharacterBuilderStepId[] {
  const merged = new Set([...attemptedStepIds, ...stepIds])
  return [...merged]
}
