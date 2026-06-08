import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'

import { useModal } from './use-modal'

describe('useModal', () => {
  it('opens and closes imperatively', () => {
    const { result } = renderHook(() => useModal())
    expect(result.current.open).toBe(false)

    act(() => result.current.openModal())
    expect(result.current.open).toBe(true)

    act(() => result.current.closeModal())
    expect(result.current.open).toBe(false)
  })

  it('confirm() resolves true on handleConfirm', async () => {
    const { result } = renderHook(() => useModal())

    let promise!: Promise<boolean>
    act(() => {
      promise = result.current.confirm()
    })
    expect(result.current.open).toBe(true)

    act(() => result.current.handleConfirm())
    await expect(promise).resolves.toBe(true)
    expect(result.current.open).toBe(false)
  })

  it('confirm() resolves false on handleCancel', async () => {
    const { result } = renderHook(() => useModal())

    let promise!: Promise<boolean>
    act(() => {
      promise = result.current.confirm()
    })

    act(() => result.current.handleCancel())
    await expect(promise).resolves.toBe(false)
    expect(result.current.open).toBe(false)
  })

  it('confirm() resolves false when dismissed via onOpenChange', async () => {
    const { result } = renderHook(() => useModal())

    let promise!: Promise<boolean>
    act(() => {
      promise = result.current.confirm()
    })

    act(() => result.current.onOpenChange(false))
    await expect(promise).resolves.toBe(false)
  })

  it('resolves a pending confirm() with false on unmount', async () => {
    const { result, unmount } = renderHook(() => useModal())

    let promise!: Promise<boolean>
    act(() => {
      promise = result.current.confirm()
    })

    unmount()
    await expect(promise).resolves.toBe(false)
  })
})
