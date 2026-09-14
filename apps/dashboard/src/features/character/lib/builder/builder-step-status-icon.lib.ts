import type { StatusIconVariant } from '@rpg/ui'

import type { StepStatus } from './builder-step-visual-status'

export const STEP_STATUS_TO_ICON_VARIANT = {
  complete: 'ready',
  error: 'needsAttention',
  locked: 'off',
  idle: 'incomplete',
  active: 'incomplete',
} as const satisfies Record<StepStatus, StatusIconVariant>

export function resolveStepStatusIconVariant(status: StepStatus): StatusIconVariant {
  return STEP_STATUS_TO_ICON_VARIANT[status]
}
