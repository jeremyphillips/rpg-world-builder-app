import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useRelativeTimeNow } from './use-relative-time-now'

describe('useRelativeTimeNow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-30T12:00:30.000Z'))
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('aligns the first tick to the next minute boundary', () => {
    const { result } = renderHook(() => useRelativeTimeNow())

    expect(result.current.toISOString()).toBe('2026-07-30T12:00:30.000Z')

    act(() => {
      vi.advanceTimersByTime(29_999)
    })
    expect(result.current.toISOString()).toBe('2026-07-30T12:00:30.000Z')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current.toISOString()).toBe('2026-07-30T12:01:00.000Z')
  })

  it('refreshes immediately when visibility returns', () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    })

    const { result } = renderHook(() => useRelativeTimeNow())
    expect(result.current.toISOString()).toBe('2026-07-30T12:00:30.000Z')

    act(() => {
      vi.setSystemTime(new Date('2026-07-30T12:05:45.000Z'))
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        value: 'visible',
      })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(result.current.toISOString()).toBe('2026-07-30T12:05:45.000Z')
  })
})
