import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { usePendingAwareOpenChange } from './use-pending-aware-open-change.client'

describe('usePendingAwareOpenChange', () => {
  it('closes on user dismiss when idle', () => {
    const onOpenChange = vi.fn()
    const { result } = renderHook(() => usePendingAwareOpenChange({ pending: false, onOpenChange }))

    act(() => result.current.handleOpenChange(false))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('opens without guard when nextOpen is true', () => {
    const onOpenChange = vi.fn()
    const { result } = renderHook(() => usePendingAwareOpenChange({ pending: true, onOpenChange }))

    act(() => result.current.handleOpenChange(true))

    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('blocks user dismiss while pending', () => {
    const onOpenChange = vi.fn()
    const { result } = renderHook(() => usePendingAwareOpenChange({ pending: true, onOpenChange }))

    act(() => result.current.handleOpenChange(false))

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('trustedClose closes while pending', () => {
    const onOpenChange = vi.fn()
    const { result } = renderHook(() => usePendingAwareOpenChange({ pending: true, onOpenChange }))

    act(() => result.current.trustedClose())

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('allowDismissWhilePending lets user dismiss while pending', () => {
    const onOpenChange = vi.fn()
    const { result } = renderHook(() =>
      usePendingAwareOpenChange({
        pending: true,
        allowDismissWhilePending: true,
        onOpenChange,
      }),
    )

    act(() => result.current.handleOpenChange(false))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
