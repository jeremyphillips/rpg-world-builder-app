import { Button, Modal } from '@rpg/ui'

import {
  resolveCreateSetupActiveSequenceSetId,
  resolveCreateSetupIsFinalSet,
} from './create-setup-sequence.lib'
import type { CreateSetupExternalDecision, CreateSetupSequenceModel } from './create-setup.types'

export type CreateSetupFooterActionVisibility = 'always' | 'final-set'

export type CreateSetupFooterAction = {
  id: string
  label: string
  visibility: CreateSetupFooterActionVisibility
  disabled?: boolean
}

export function resolveCreateSetupFooterActions(
  actions: readonly CreateSetupFooterAction[],
  context: {
    sequenceSetIds: readonly string[]
    activeSetId: string | null
    isEditingUpstream?: boolean
    externalDecisions?: readonly Pick<CreateSetupExternalDecision, 'id'>[]
  },
): CreateSetupFooterAction[] {
  const activeSequenceSetId = resolveCreateSetupActiveSequenceSetId({
    activeSetId: context.activeSetId,
    isEditingUpstream: context.isEditingUpstream,
    externalDecisions: context.externalDecisions,
  })

  const isFinalSet = resolveCreateSetupIsFinalSet({
    sequenceSetIds: context.sequenceSetIds,
    activeSequenceSetId,
  })

  return actions.flatMap((action) => {
    if (action.visibility === 'always') {
      return [action]
    }
    return isFinalSet ? [action] : []
  })
}

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
