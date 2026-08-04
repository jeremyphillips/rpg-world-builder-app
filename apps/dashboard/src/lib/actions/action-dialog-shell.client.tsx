'use client'

import type { ActionTargetFailure } from '@rpg/contracts'
import { Alert, Modal } from '@rpg/ui'

import { ActionDialogShellFooter } from './action-dialog-shell-footer.client'
import {
  ACTION_DIALOG_MODAL_SIZE,
  isActionResolvePhase,
  resolveActionDialogHeadline,
  shouldRenderActionConfigureBody,
  shouldRenderActionResolutionList,
} from './action-dialog-shell.lib'
import type { ActionLifecyclePhase } from './action-lifecycle.types'
import { ActionTargetResolutionList } from './action-target-resolution-list.client'

export type ActionDialogShellProps<TBlocker, TFailure extends ActionTargetFailure> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  phase: ActionLifecyclePhase
  pending?: boolean
  headline: string
  description?: string
  configureSlot?: React.ReactNode
  summarySlot?: React.ReactNode
  localError?: string | null
  campaignId?: string
  resolutionRows?: Parameters<typeof ActionTargetResolutionList<TBlocker, TFailure>>[0]['rows']
  resolutionLegend?: string
  confirmedCount?: number
  resolveNoun?: string
  onCheckedChange?: (targetId: string, checked: boolean) => void
  onConfigureApply?: () => void
  configureApplyDisabled?: boolean
  onResolveConfirm?: () => void
  onResolveBack?: () => void
  onRetryFailed?: () => void
  onCancel?: () => void
  onAcceptMixedResult?: () => void
}

export function ActionDialogShell<TBlocker, TFailure extends ActionTargetFailure>({
  open,
  onOpenChange,
  phase,
  pending = false,
  headline,
  description,
  configureSlot,
  summarySlot,
  localError,
  campaignId,
  resolutionRows = [],
  resolutionLegend,
  confirmedCount = 0,
  resolveNoun = 'items',
  onCheckedChange,
  onConfigureApply,
  configureApplyDisabled = false,
  onResolveConfirm,
  onResolveBack,
  onRetryFailed,
  onCancel,
  onAcceptMixedResult,
}: ActionDialogShellProps<TBlocker, TFailure>) {
  const resolvedHeadline = resolveActionDialogHeadline({
    phase,
    headline,
    confirmedCount,
    resolveNoun,
  })

  const handleCancel = () => {
    if (phase === 'result') {
      onAcceptMixedResult?.()
      return
    }

    onCancel?.()
    onOpenChange(false)
  }

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size={ACTION_DIALOG_MODAL_SIZE} aria-busy={pending || undefined}>
        <Modal.Header headline={resolvedHeadline} description={description} />

        <Modal.Body className="space-y-4">
          {shouldRenderActionConfigureBody(phase) ? configureSlot : null}
          {shouldRenderActionConfigureBody(phase) && summarySlot ? summarySlot : null}

          {shouldRenderActionResolutionList(phase) ? (
            <ActionTargetResolutionList
              rows={resolutionRows}
              campaignId={campaignId}
              legend={resolutionLegend}
              onCheckedChange={isActionResolvePhase(phase) ? onCheckedChange : undefined}
            />
          ) : null}

          {localError ? (
            <Alert variant="destructive" title="Could not continue" description={localError} />
          ) : null}
        </Modal.Body>

        <Modal.Footer>
          <ActionDialogShellFooter
            phase={phase}
            pending={pending}
            confirmedCount={confirmedCount}
            configureApplyDisabled={configureApplyDisabled}
            onResolveBack={onResolveBack}
            onCancel={handleCancel}
            onConfigureApply={onConfigureApply}
            onResolveConfirm={onResolveConfirm}
            onRetryFailed={onRetryFailed}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
