import { describe, expect, it } from 'vitest'

import {
  shouldEmitActionResultToast,
  shouldEmitActionSuccessToast,
  shouldSuppressActionErrorToast,
} from './action-toast-policy'

describe('action toast policy', () => {
  it('suppresses error toasts while expected blockers are shown in the modal', () => {
    expect(
      shouldSuppressActionErrorToast({
        modalOpen: true,
        phase: 'resolve',
        hasExpectedBlockers: true,
        hasOperationalFailures: false,
      }),
    ).toBe(true)
  })

  it('suppresses error toasts while operational failures are shown in the result phase', () => {
    expect(
      shouldSuppressActionErrorToast({
        modalOpen: true,
        phase: 'result',
        hasExpectedBlockers: false,
        hasOperationalFailures: true,
      }),
    ).toBe(true)
  })

  it('allows result toasts only after the modal closes and the user accepts the outcome', () => {
    expect(shouldEmitActionResultToast({ modalOpen: true, accepted: true })).toBe(false)
    expect(shouldEmitActionResultToast({ modalOpen: false, accepted: true })).toBe(true)
    expect(shouldEmitActionSuccessToast({ modalOpen: false, fullSuccess: true })).toBe(true)
  })
})
