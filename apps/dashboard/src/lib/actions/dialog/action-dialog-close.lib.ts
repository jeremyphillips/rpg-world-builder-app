import { partitionApplyOutcomes, type ActionTargetFailure } from '@rpg/contracts'

import { deriveActionApplySummary } from '../action-apply-summary.lib'
import type { ActionLifecycleCloseEvent } from '../lifecycle/action-lifecycle.types'
import { shouldNotifyActionOutcomes } from '../action-outcome-notify.lib'

/** Close the dialog first, then run post-close side effects (toast, selection sync). */
export function finalizeActionDialogClose(
  onOpenChange: (open: boolean) => void,
  sideEffects?: () => void,
): void {
  onOpenChange(false)

  if (!sideEffects) {
    return
  }

  queueMicrotask(() => {
    try {
      sideEffects()
    } catch {
      // Best-effort after close — must not fail the apply lifecycle.
    }
  })
}

export type FinalizeActionDialogCloseWithOutcomesInput = {
  onOpenChange: (open: boolean) => void
  event: ActionLifecycleCloseEvent<unknown, ActionTargetFailure>
  syncOutcomes: () => void
  notify?: () => void
  closedRef: { current: boolean }
}

/**
 * Sync selection/cache for updated targets, close the dialog, then optionally toast.
 * Ordering: sync → close → notify (microtask). Idempotent per dialog open cycle.
 */
export function finalizeActionDialogCloseWithOutcomes({
  onOpenChange,
  event,
  syncOutcomes,
  notify,
  closedRef,
}: FinalizeActionDialogCloseWithOutcomesInput): void {
  if (closedRef.current) {
    onOpenChange(false)
    return
  }

  closedRef.current = true

  const summary = deriveActionApplySummary(event.outcomes)
  if (summary.updatedIds.length > 0) {
    syncOutcomes()
  }

  onOpenChange(false)

  if (!notify) {
    return
  }

  queueMicrotask(() => {
    try {
      notify()
    } catch {
      // Best-effort after close — must not fail the apply lifecycle.
    }
  })
}

export type BuildActionDialogNotifyInput = {
  event: ActionLifecycleCloseEvent<unknown, ActionTargetFailure>
  notify: () => void
}

/** Returns a notify callback when toast policy permits post-close feedback. */
export function buildActionDialogNotify({
  event,
  notify,
}: BuildActionDialogNotifyInput): (() => void) | undefined {
  const counts = partitionApplyOutcomes(event.outcomes)

  if (!shouldNotifyActionOutcomes(counts, event.reason)) {
    return undefined
  }

  return notify
}
