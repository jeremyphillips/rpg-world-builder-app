import { describe, expect, it, vi } from 'vitest'

import { notifyActionOutcomes, shouldNotifyActionOutcomes } from './action-outcome-notify.lib'

vi.mock('@rpg/ui', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    success: vi.fn(),
  },
}))

import { toast } from '@rpg/ui'

describe('shouldNotifyActionOutcomes', () => {
  it('suppresses cancel and blocker-only closes', () => {
    expect(
      shouldNotifyActionOutcomes(
        {
          updated: [],
          blocked: [{ status: 'blocked', targetId: 'a', blockers: [] }],
          failed: [],
          unchanged: [],
        },
        'cancel',
      ),
    ).toBe(false)

    expect(
      shouldNotifyActionOutcomes(
        {
          updated: [],
          blocked: [{ status: 'blocked', targetId: 'a', blockers: [] }],
          failed: [],
          unchanged: [],
        },
        'success',
      ),
    ).toBe(false)
  })

  it('allows operational failure-only and accepted mixed outcomes', () => {
    expect(
      shouldNotifyActionOutcomes(
        {
          updated: [],
          blocked: [],
          failed: [
            {
              status: 'failed',
              targetId: 'a',
              failure: { code: 'request_error', message: 'Fail.' },
            },
          ],
          unchanged: [],
        },
        'accepted-mixed',
      ),
    ).toBe(true)

    expect(
      shouldNotifyActionOutcomes(
        {
          updated: [{ status: 'updated', targetId: 'a' }],
          blocked: [{ status: 'blocked', targetId: 'b', blockers: [] }],
          failed: [],
          unchanged: [],
        },
        'accepted-mixed',
      ),
    ).toBe(true)
  })
})

describe('notifyActionOutcomes', () => {
  it('does not toast blocker-only outcomes after close', () => {
    notifyActionOutcomes({
      outcomes: [
        {
          status: 'blocked',
          targetId: 'a',
          blockers: [{ kind: 'rule', code: 'x', message: 'No.' }],
        },
      ],
      nounPlural: 'items',
      closeReason: 'success',
    })

    expect(toast.error).not.toHaveBeenCalled()
    expect(toast.warning).not.toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('toasts operational failures after close', () => {
    notifyActionOutcomes({
      outcomes: [
        {
          status: 'failed',
          targetId: 'a',
          failure: { code: 'request_error', message: 'Network error.' },
        },
      ],
      nounPlural: 'items',
      closeReason: 'accepted-mixed',
    })

    expect(toast.error).toHaveBeenCalledOnce()
  })
})
