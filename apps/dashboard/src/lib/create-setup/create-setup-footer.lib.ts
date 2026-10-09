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
