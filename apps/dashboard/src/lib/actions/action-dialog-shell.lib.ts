import type { ModalSize } from '@rpg/ui'

import { formatActionResolveHeadline, formatActionResultHeadline } from './action-messages'
import type { ActionLifecyclePhase } from './action-lifecycle.types'

/** Shared width for configure, resolve, result, and single-blocked action modals. */
export const ACTION_DIALOG_MODAL_SIZE = 'md' satisfies ModalSize

export function resolveActionDialogHeadline({
  phase,
  headline,
  confirmedCount,
  resolveNoun,
}: {
  phase: ActionLifecyclePhase
  headline: string
  confirmedCount: number
  resolveNoun: string
}): string {
  if (phase === 'resolve') {
    return formatActionResolveHeadline(confirmedCount, resolveNoun)
  }

  if (phase === 'result') {
    return formatActionResultHeadline()
  }

  return headline
}

export function shouldRenderActionResolutionList(phase: ActionLifecyclePhase): boolean {
  return phase === 'resolve' || phase === 'result'
}

export function shouldRenderActionConfigureBody(phase: ActionLifecyclePhase): boolean {
  return phase === 'configure'
}

export function resolveActionCancelLabel(phase: ActionLifecyclePhase): string {
  return phase === 'result' ? 'Close' : 'Cancel'
}

export function isActionResolvePhase(phase: ActionLifecyclePhase): boolean {
  return phase === 'resolve'
}

export function isActionResultPhase(phase: ActionLifecyclePhase): boolean {
  return phase === 'result'
}

export function isActionConfigurePhase(phase: ActionLifecyclePhase): boolean {
  return phase === 'configure'
}
