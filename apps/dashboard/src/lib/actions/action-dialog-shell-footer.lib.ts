import type { ActionLifecyclePhase } from './action-lifecycle.types'
import {
  isActionConfigurePhase,
  isActionResolvePhase,
  isActionResultPhase,
} from './action-dialog-shell.lib'

export function shouldRenderActionConfigureApplyButton(
  phase: ActionLifecyclePhase,
  configureApplyHidden: boolean,
): boolean {
  return isActionConfigurePhase(phase) && !configureApplyHidden
}

export function shouldRenderActionResolveApplyButton(
  phase: ActionLifecyclePhase,
  resolveApplyHidden: boolean,
): boolean {
  return isActionResolvePhase(phase) && !resolveApplyHidden
}

export function shouldRenderActionResolveBackButton(phase: ActionLifecyclePhase): boolean {
  return isActionResolvePhase(phase)
}

export function shouldRenderActionRetryFailedButton(phase: ActionLifecyclePhase): boolean {
  return isActionResultPhase(phase)
}
