/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  CATALOG_PICKER_COMMIT_SUCCESS_MS,
  useCatalogPickerCommitConfirmation,
} from './use-catalog-picker-commit-confirmation.client'

describe('useCatalogPickerCommitConfirmation', () => {
  it('flashes success quantity then clears after the shared interval', () => {
    vi.useFakeTimers()
    const commit = vi.fn(() => true)

    const { result } = renderHook(() => useCatalogPickerCommitConfirmation({ commit }))

    act(() => {
      result.current.confirm(2)
    })

    expect(commit).toHaveBeenCalledWith(2)
    expect(result.current.successQuantity).toBe(2)
    expect(result.current.isSuccess).toBe(true)

    act(() => {
      vi.advanceTimersByTime(CATALOG_PICKER_COMMIT_SUCCESS_MS)
    })

    expect(result.current.successQuantity).toBeUndefined()
    expect(result.current.isSuccess).toBe(false)

    vi.useRealTimers()
  })
})
