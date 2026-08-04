'use client'

import { Button } from '@rpg/ui'

import {
  ACTION_CANCEL_LABEL,
  ACTION_CLOSE_LABEL,
  ACTION_CONFIGURE_APPLY_LABEL,
  ACTION_RESOLVE_APPLY_LABEL,
  ACTION_RESOLVE_BACK_LABEL,
  ACTION_RETRY_FAILED_LABEL,
} from './action-messages'
import {
  isActionConfigurePhase,
  isActionResolvePhase,
  isActionResultPhase,
  resolveActionCancelLabel,
} from './action-dialog-shell.lib'
import type { ActionLifecyclePhase } from './action-lifecycle.types'

export type ActionDialogShellFooterProps = {
  phase: ActionLifecyclePhase
  pending: boolean
  confirmedCount: number
  configureApplyDisabled: boolean
  configureApplyLabel?: string
  onResolveBack?: () => void
  onCancel: () => void
  onConfigureApply?: () => void
  onResolveConfirm?: () => void
  onRetryFailed?: () => void
}

export function ActionDialogShellFooter({
  phase,
  pending,
  confirmedCount,
  configureApplyDisabled,
  configureApplyLabel,
  onResolveBack,
  onCancel,
  onConfigureApply,
  onResolveConfirm,
  onRetryFailed,
}: ActionDialogShellFooterProps) {
  const cancelLabel = resolveActionCancelLabel(phase)

  return (
    <>
      {isActionResolvePhase(phase) ? (
        <Button type="button" variant="outline" disabled={pending} onClick={onResolveBack}>
          {ACTION_RESOLVE_BACK_LABEL}
        </Button>
      ) : null}

      <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
        {cancelLabel === 'Close' ? ACTION_CLOSE_LABEL : ACTION_CANCEL_LABEL}
      </Button>

      {isActionConfigurePhase(phase) ? (
        <Button
          type="button"
          disabled={pending || configureApplyDisabled}
          onClick={onConfigureApply}
        >
          {configureApplyLabel ?? ACTION_CONFIGURE_APPLY_LABEL}
        </Button>
      ) : null}

      {isActionResolvePhase(phase) ? (
        <Button type="button" disabled={pending || confirmedCount === 0} onClick={onResolveConfirm}>
          {ACTION_RESOLVE_APPLY_LABEL}
        </Button>
      ) : null}

      {isActionResultPhase(phase) ? (
        <Button type="button" disabled={pending} onClick={onRetryFailed}>
          {ACTION_RETRY_FAILED_LABEL}
        </Button>
      ) : null}
    </>
  )
}
