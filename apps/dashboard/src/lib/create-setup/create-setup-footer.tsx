import { Button, Modal } from '@rpg/ui'

import { deriveCreateSetupFooterState } from './create-setup-footer.lib'
import type { CreateSetupSequenceModel } from './create-setup.types'

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
    <Modal.FooterActions>
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
    </Modal.FooterActions>
  )
}
