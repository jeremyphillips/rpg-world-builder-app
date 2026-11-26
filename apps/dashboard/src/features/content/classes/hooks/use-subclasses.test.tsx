import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { makeQueryWrapper } from '@/test/make-wrapper'

import { useSubclasses } from './use-subclasses'

vi.mock('../api/subclasses-api', () => ({
  fetchSubclasses: vi.fn(),
}))

import { fetchSubclasses } from '../api/subclasses-api'

const fetchSubclassesMock = vi.mocked(fetchSubclasses)

describe('useSubclasses', () => {
  beforeEach(() => {
    fetchSubclassesMock.mockReset()
  })

  it('selects resolved subclasses and omits overlayFailures', async () => {
    fetchSubclassesMock.mockResolvedValue({
      subclasses: [{ id: 'healthy', name: 'Healthy' }],
      overlayFailures: [
        {
          targetId: 'broken',
          slug: 'broken',
          name: 'Broken',
          code: 'overlay_validation',
          message: 'Stored system overlay is invalid.',
        },
      ],
    } as Awaited<ReturnType<typeof fetchSubclasses>>)

    const { result } = renderHook(() => useSubclasses('camp-1', 'class-1'), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([{ id: 'healthy', name: 'Healthy' }])
  })
})
