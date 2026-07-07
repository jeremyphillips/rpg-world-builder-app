import type { BuilderStepStatus, CharacterBuilderStepId } from '@rpg/contracts'

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

export type BuilderStepStatusBadgeVariant = 'default' | 'secondary' | 'outline'

export function builderStepStatusBadgeVariant(
  status: BuilderStepStatus,
): BuilderStepStatusBadgeVariant {
  switch (status) {
    case 'complete':
      return 'secondary'
    case 'active':
      return 'default'
    case 'incomplete':
    case 'deferred':
      return 'outline'
  }
}
