import { Button } from '@rpg/ui'

import {
  ACTION_CANCEL_LABEL,
  ACTION_CLOSE_LABEL,
  ACTION_CONFIGURE_APPLY_LABEL,
  ACTION_RESOLVE_APPLY_LABEL,
  ACTION_RESOLVE_BACK_LABEL,
  ACTION_RETRY_FAILED_LABEL,
} from '../action-messages'
import {
  shouldRenderActionConfigureApplyButton,
  shouldRenderActionResolveApplyButton,
  shouldRenderActionResolveBackButton,
  shouldRenderActionRetryFailedButton,
} from './action-dialog-shell-footer.lib'
import { resolveActionCancelLabel } from './action-dialog-shell.lib'
import type { ActionLifecyclePhase } from '../lifecycle/action-lifecycle.types'

export type ActionDialogShellFooterProps = {
  phase: ActionLifecyclePhase
  pending: boolean
  confirmedCount: number
  configureApplyDisabled: boolean
  configureApplyLabel?: string
  configureApplyHidden?: boolean
  resolveApplyLabel?: string
  resolveApplyHidden?: boolean
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
  configureApplyHidden = false,
  resolveApplyLabel,
  resolveApplyHidden = false,
  onResolveBack,
  onCancel,
  onConfigureApply,
  onResolveConfirm,
  onRetryFailed,
}: ActionDialogShellFooterProps) {
  const cancelLabel = resolveActionCancelLabel(phase)
  const showConfigureApply = shouldRenderActionConfigureApplyButton(phase, configureApplyHidden)
  const showResolveApply = shouldRenderActionResolveApplyButton(phase, resolveApplyHidden)

  return (
    <>
      {shouldRenderActionResolveBackButton(phase) ? (
        <Button type="button" variant="outline" disabled={pending} onClick={onResolveBack}>
          {ACTION_RESOLVE_BACK_LABEL}
        </Button>
      ) : null}

      <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
        {cancelLabel === 'Close' ? ACTION_CLOSE_LABEL : ACTION_CANCEL_LABEL}
      </Button>

      {showConfigureApply ? (
        <Button
          type="button"
          disabled={pending || configureApplyDisabled}
          onClick={onConfigureApply}
        >
          {configureApplyLabel ?? ACTION_CONFIGURE_APPLY_LABEL}
        </Button>
      ) : null}

      {showResolveApply ? (
        <Button type="button" disabled={pending || confirmedCount === 0} onClick={onResolveConfirm}>
          {resolveApplyLabel ?? ACTION_RESOLVE_APPLY_LABEL}
        </Button>
      ) : null}

      {shouldRenderActionRetryFailedButton(phase) ? (
        <Button type="button" disabled={pending} onClick={onRetryFailed}>
          {ACTION_RETRY_FAILED_LABEL}
        </Button>
      ) : null}
    </>
  )
}
