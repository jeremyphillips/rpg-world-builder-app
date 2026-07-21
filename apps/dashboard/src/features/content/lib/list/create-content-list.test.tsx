import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'

import { makeQueryWrapper } from '@/test/make-wrapper'

import { formatContentListLoadErrorMessage } from '../content-type-labels'

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
    mockRequest.mockResolvedValue({ equipment: [{ id: 'w1' }] })

    const listEquipment = createContentListApi<{ id: string }>({
      routeKey: 'equipment',
      responseKey: 'equipment',
      errorMessage: formatContentListLoadErrorMessage('equipment'),
    })

    const result = await listEquipment('camp-1')

    expect(mockRequest).toHaveBeenCalledWith(
      '/api/campaigns/camp-1/content/equipment',
      undefined,
      formatContentListLoadErrorMessage('equipment'),
    )
    expect(result).toEqual([{ id: 'w1' }])
  })
})

describe('createContentQueryHook', () => {
  const config = {
    routeKey: 'skill-proficiencies',
    responseKey: 'skillProficiencies',
    errorMessage: formatContentListLoadErrorMessage('skill-proficiencies'),
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
