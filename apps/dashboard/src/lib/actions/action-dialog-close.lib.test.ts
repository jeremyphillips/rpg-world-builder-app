import { describe, expect, it, vi } from 'vitest'

import { finalizeActionDialogClose } from './action-dialog-close.lib'

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
