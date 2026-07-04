import type { BuilderStepStatus } from '@rpg/contracts'

export const BUILDER_STEP_STATUS_LABELS: Record<BuilderStepStatus, string> = {
  complete: 'Complete',
  active: 'Current',
  incomplete: 'Incomplete',
  deferred: 'Later',
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
