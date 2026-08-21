/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  EQUIPMENT_ACQUISITION_COMMIT_SUCCESS_MS,
  useEquipmentAcquisitionCommitConfirmation,
} from './use-equipment-acquisition-commit-confirmation'

describe('useEquipmentAcquisitionCommitConfirmation', () => {
  it('resets quantity and shows success after commit', () => {
    vi.useFakeTimers()
    const commit = vi.fn(() => true)

    const { result } = renderHook(() => useEquipmentAcquisitionCommitConfirmation({ commit }))

    act(() => {
      result.current.setQuantity(3)
    })
    expect(result.current.quantity).toBe(3)

    act(() => {
      result.current.confirm(3)
    })

    expect(commit).toHaveBeenCalledWith(3)
    expect(result.current.quantity).toBe(1)
    expect(result.current.isSuccess).toBe(true)

    act(() => {
      vi.advanceTimersByTime(EQUIPMENT_ACQUISITION_COMMIT_SUCCESS_MS)
    })

    expect(result.current.isSuccess).toBe(false)
    vi.useRealTimers()
  })

  it('surfaces row-phase failure when commit returns false', () => {
    const commit = vi.fn(() => false)

    const { result } = renderHook(() => useEquipmentAcquisitionCommitConfirmation({ commit }))

    act(() => {
      result.current.confirm(1)
    })

    expect(commit).toHaveBeenCalledWith(1)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.commitFailed).toBe(true)
  })
})
