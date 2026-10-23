import type { BuilderStepStatus } from '@rpg/contracts'
import type { CharacterBuilderStepId } from '@rpg/contracts/rpg/character-builder'

export const BUILDER_STEP_STATUS_LABELS: Record<BuilderStepStatus, string> = {
  complete: 'Complete',
  active: 'Current',
  incomplete: 'Incomplete',
  deferred: 'Later',
}

/** MVP-A: deferred spells before choice resolvers run use the not-applicable label. */
export function getBuilderStepStatusLabel(
  stepId: CharacterBuilderStepId,
  status: BuilderStepStatus,
  resolvedChoiceSets: null,
): string
export function getBuilderStepStatusLabel(
  stepId: CharacterBuilderStepId,
  status: BuilderStepStatus,
  resolvedChoiceSets?: readonly unknown[] | null,
): string
export function getBuilderStepStatusLabel(
  stepId: CharacterBuilderStepId,
  status: BuilderStepStatus,
  resolvedChoiceSets?: readonly unknown[] | null,
): string {
  if (stepId === 'spells' && status === 'deferred' && resolvedChoiceSets === null) {
    return 'Not applicable'
  }

  return BUILDER_STEP_STATUS_LABELS[status]
}
