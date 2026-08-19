'use client'

import { Button, dialogPanelActionRowClasses } from '@rpg/ui'

import type { CreateSetupSequenceModel } from './create-setup.types'

export type CreateSetupFooterState =
  | 'cancel-only'
  | 'continue-disabled'
  | 'continue-enabled'
  | 're-entry-continue'

export function deriveCreateSetupFooterState(
  model: CreateSetupSequenceModel,
): CreateSetupFooterState {
  if (model.isComplete) {
    return 're-entry-continue'
  }

  const pendingExplicit = model.pendingExplicitDecisions[0]
  if (pendingExplicit) {
    return pendingExplicit.isResolved ? 'continue-enabled' : 'continue-disabled'
  }

  return 'cancel-only'
}

export type CreateSetupFooterProps = {
  model: CreateSetupSequenceModel
  onCancel: () => void
  /** Called when setup is complete and the user confirms re-entry Continue. */
  onSetupComplete?: () => void
}

export function CreateSetupFooter({ model, onCancel, onSetupComplete }: CreateSetupFooterProps) {
  const footerState = deriveCreateSetupFooterState(model)
  const pendingExplicit = model.pendingExplicitDecisions[0]
  const continueLabel = pendingExplicit?.completeLabel ?? 'Continue'

  const handleContinue = () => {
    if (footerState === 're-entry-continue') {
      onSetupComplete?.()
      return
    }

    if (footerState === 'continue-enabled' && pendingExplicit) {
      model.completeExplicitDecision(pendingExplicit.id)
    }
  }

  return (
    <div className={dialogPanelActionRowClasses}>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      {footerState === 'cancel-only' ? null : (
        <Button
          type="button"
          disabled={footerState === 'continue-disabled'}
          onClick={handleContinue}
        >
          {continueLabel}
        </Button>
      )}
    </div>
  )
}
