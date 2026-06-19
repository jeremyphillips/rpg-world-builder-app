import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

import { makeQueryWrapper } from '@/test/make-wrapper'

vi.mock('@/lib/api-client', () => ({
  request: vi.fn(),
}))

import { request } from '@/lib/api-client'

import { createContentListApi, createContentQueryHook } from './create-content-list'

const mockRequest = vi.mocked(request)

describe('createContentListApi', () => {
  beforeEach(() => {
    mockRequest.mockReset()
  })

  it('requests the correct URL and extracts the response key', async () => {
    mockRequest.mockResolvedValue({ weapons: [{ id: 'w1' }] })

    const listWeapons = createContentListApi<{ id: string }>({
      routeKey: 'weapons',
      responseKey: 'weapons',
      errorMessage: 'Could not load weapons.',
    })

    const result = await listWeapons('camp-1')

    expect(mockRequest).toHaveBeenCalledWith(
      '/api/campaigns/camp-1/content/weapons',
      undefined,
      'Could not load weapons.',
    )
    expect(result).toEqual([{ id: 'w1' }])
  })
})

describe('createContentQueryHook', () => {
  const config = {
    routeKey: 'skill-proficiencies',
    responseKey: 'skillProficiencies',
    errorMessage: 'Could not load skill proficiencies.',
  } as const

  it('builds the query key from routeKey', () => {
    const { queryKey } = createContentQueryHook(config, vi.fn())

    expect(queryKey('camp-2')).toEqual(['campaigns', 'camp-2', 'content', 'skill-proficiencies'])
  })

  it('does not fetch when campaignId is undefined', () => {
    const listFn = vi.fn()
    const { useQuery } = createContentQueryHook(config, listFn)

    const { result } = renderHook(() => useQuery(undefined), {
      wrapper: makeQueryWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
    expect(listFn).not.toHaveBeenCalled()
  })
})
