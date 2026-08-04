import type { ActionLifecyclePhase } from './action-lifecycle.types'

export type ActionToastPolicyInput = {
  modalOpen: boolean
  phase: ActionLifecyclePhase
  hasExpectedBlockers: boolean
  hasOperationalFailures: boolean
}

export function shouldSuppressActionErrorToast({
  modalOpen,
  phase,
  hasExpectedBlockers,
  hasOperationalFailures,
}: ActionToastPolicyInput): boolean {
  if (!modalOpen) {
    return false
  }

  if (hasExpectedBlockers && (phase === 'resolve' || phase === 'validating')) {
    return true
  }

  if (hasOperationalFailures && (phase === 'result' || phase === 'submitting')) {
    return true
  }

  return false
}

export function shouldEmitActionResultToast({
  modalOpen,
  accepted,
}: {
  modalOpen: boolean
  accepted: boolean
}): boolean {
  return !modalOpen && accepted
}

export function shouldEmitActionSuccessToast({
  modalOpen,
  fullSuccess,
}: {
  modalOpen: boolean
  fullSuccess: boolean
}): boolean {
  return !modalOpen && fullSuccess
}
