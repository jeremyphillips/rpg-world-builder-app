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

  describe('guarded close', () => {
    it('closes immediately when shouldConfirmClose is false', () => {
      const { result } = renderHook(() => useModal({ shouldConfirmClose: false }))
      act(() => result.current.openModal())

      act(() => result.current.onOpenChange(false))
      expect(result.current.open).toBe(false)
      expect(result.current.confirmingClose).toBe(false)
    })

    it('opens the guard instead of closing when shouldConfirmClose is true', () => {
      const { result } = renderHook(() => useModal({ shouldConfirmClose: true }))
      act(() => result.current.openModal())

      act(() => result.current.onOpenChange(false))
      expect(result.current.open).toBe(true)
      expect(result.current.confirmingClose).toBe(true)
    })

    it('cancelClose dismisses the guard and keeps the modal open', () => {
      const { result } = renderHook(() => useModal({ shouldConfirmClose: true }))
      act(() => result.current.openModal())
      act(() => result.current.requestClose())

      act(() => result.current.cancelClose())
      expect(result.current.confirmingClose).toBe(false)
      expect(result.current.open).toBe(true)
    })

    it('confirmCloseAndExit dismisses the guard and closes the modal', () => {
      const { result } = renderHook(() => useModal({ shouldConfirmClose: true }))
      act(() => result.current.openModal())
      act(() => result.current.requestClose())

      act(() => result.current.confirmCloseAndExit())
      expect(result.current.confirmingClose).toBe(false)
      expect(result.current.open).toBe(false)
    })
  })
})
