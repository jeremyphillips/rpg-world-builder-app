import type { BuilderStepStatus, CharacterBuilderStepId } from '@rpg/contracts'

export const BUILDER_STEP_STATUS_LABELS: Record<BuilderStepStatus, string> = {
  complete: 'Complete',
  active: 'Current',
  incomplete: 'Incomplete',
  deferred: 'Later',
}

/** MVP-A: spells show as skipped while choice resolvers are deferred and classes are non-casters. */
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
    return 'Skipped'
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
