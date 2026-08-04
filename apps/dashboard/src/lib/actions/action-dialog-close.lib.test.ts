import { describe, expect, it, vi } from 'vitest'

import {
  buildActionDialogNotify,
  finalizeActionDialogClose,
  finalizeActionDialogCloseWithOutcomes,
} from './action-dialog-close.lib'

describe('finalizeActionDialogClose', () => {
  it('closes before running side effects', async () => {
    const order: string[] = []
    const onOpenChange = vi.fn(() => {
      order.push('close')
    })
    const sideEffects = vi.fn(() => {
      order.push('side-effects')
    })

    finalizeActionDialogClose(onOpenChange, sideEffects)

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(sideEffects).not.toHaveBeenCalled()
    expect(order).toEqual(['close'])

    await Promise.resolve()
    expect(sideEffects).toHaveBeenCalledOnce()
    expect(order).toEqual(['close', 'side-effects'])
  })

  it('swallows side-effect throws after close', async () => {
    const onOpenChange = vi.fn()
    const sideEffects = vi.fn(() => {
      throw new Error('Toast failed.')
    })

    finalizeActionDialogClose(onOpenChange, sideEffects)

    expect(onOpenChange).toHaveBeenCalledWith(false)

    await Promise.resolve()
    expect(sideEffects).toHaveBeenCalledOnce()
  })
})

describe('finalizeActionDialogCloseWithOutcomes', () => {
  it('syncs updated outcomes on cancel without notifying', async () => {
    const onOpenChange = vi.fn()
    const syncOutcomes = vi.fn()
    const closedRef = { current: false }

    finalizeActionDialogCloseWithOutcomes({
      onOpenChange,
      event: {
        reason: 'cancel',
        outcomes: [
          { status: 'updated', targetId: 'a' },
          {
            status: 'blocked',
            targetId: 'b',
            blockers: [{ kind: 'rule', code: 'x', message: 'No.' }],
          },
        ],
        fullSuccess: false,
      },
      syncOutcomes,
      closedRef,
    })

    expect(syncOutcomes).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('syncs then notifies once for accepted mixed outcomes', async () => {
    const order: string[] = []
    const onOpenChange = vi.fn(() => order.push('close'))
    const syncOutcomes = vi.fn(() => order.push('sync'))
    const notify = vi.fn(() => order.push('notify'))
    const closedRef = { current: false }

    finalizeActionDialogCloseWithOutcomes({
      onOpenChange,
      event: {
        reason: 'accepted-mixed',
        outcomes: [
          { status: 'updated', targetId: 'a' },
          {
            status: 'blocked',
            targetId: 'b',
            blockers: [{ kind: 'rule', code: 'x', message: 'No.' }],
          },
        ],
        fullSuccess: false,
      },
      syncOutcomes,
      notify,
      closedRef,
    })

    expect(order).toEqual(['sync', 'close'])

    await Promise.resolve()
    expect(notify).toHaveBeenCalledOnce()
    expect(order).toEqual(['sync', 'close', 'notify'])
  })

  it('does not sync or notify twice on repeated close', async () => {
    const onOpenChange = vi.fn()
    const syncOutcomes = vi.fn()
    const closedRef = { current: false }

    const input = {
      onOpenChange,
      event: {
        reason: 'cancel' as const,
        outcomes: [{ status: 'updated' as const, targetId: 'a' }],
        fullSuccess: false,
      },
      syncOutcomes,
      closedRef,
    }

    finalizeActionDialogCloseWithOutcomes(input)
    finalizeActionDialogCloseWithOutcomes(input)

    expect(syncOutcomes).toHaveBeenCalledOnce()
    expect(onOpenChange).toHaveBeenCalledTimes(2)
  })
})

describe('buildActionDialogNotify', () => {
  it('returns undefined for blocker-only closes', () => {
    expect(
      buildActionDialogNotify({
        event: {
          reason: 'success',
          outcomes: [
            {
              status: 'blocked',
              targetId: 'a',
              blockers: [{ kind: 'rule', code: 'x', message: 'No.' }],
            },
          ],
          fullSuccess: false,
        },
        notify: vi.fn(),
      }),
    ).toBeUndefined()
  })
})
