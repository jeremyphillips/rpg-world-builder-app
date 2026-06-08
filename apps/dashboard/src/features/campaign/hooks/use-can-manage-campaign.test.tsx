import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { Campaign, SessionUser } from '@rpg/contracts'

import { makeQueryWrapper } from '@/test/make-wrapper'

vi.mock('@/features/auth/api/auth-client')
vi.mock('@/features/campaign/api/campaign-client')

import { fetchSession as fetchSessionFn } from '@/features/auth/api/auth-client'
import { listCampaigns as listCampaignsFn } from '@/features/campaign/api/campaign-client'
import { useCanManageCampaign } from './use-can-manage-campaign'

const fetchSession = vi.mocked(fetchSessionFn)
const listCampaigns = vi.mocked(listCampaignsFn)

function makeUser(overrides?: Partial<SessionUser>): SessionUser {
  return {
    id: 'u1',
    email: 'dm@example.com',
    displayName: 'Dungeon Master',
    role: 'user',
    lastSelectedCampaignId: null,
    ...overrides,
  }
}

function makeCampaign(id: string, createdBy: string): Campaign {
  return {
    id,
    identity: { name: 'Test Campaign' },
    configuration: {},
    status: 'active',
    visibility: 'private',
    createdBy,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('useCanManageCampaign', () => {
  beforeEach(() => {
    fetchSession.mockReset()
    listCampaigns.mockReset()
  })

  it('returns false when no campaignId is provided', async () => {
    fetchSession.mockResolvedValue(makeUser())
    listCampaigns.mockResolvedValue([makeCampaign('c1', 'u1')])

    const { result } = renderHook(() => useCanManageCampaign(undefined), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(false))
  })

  it('returns false when the session is still loading', () => {
    fetchSession.mockReturnValue(new Promise(() => {}))
    listCampaigns.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useCanManageCampaign('c1'), {
      wrapper: makeQueryWrapper(),
    })

    expect(result.current).toBe(false)
  })

  it('returns false when the user is not the campaign owner', async () => {
    fetchSession.mockResolvedValue(makeUser({ id: 'u1' }))
    listCampaigns.mockResolvedValue([makeCampaign('c1', 'u2')])

    const { result } = renderHook(() => useCanManageCampaign('c1'), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(false))
  })

  it('returns true when the user is the campaign owner', async () => {
    fetchSession.mockResolvedValue(makeUser({ id: 'u1' }))
    listCampaigns.mockResolvedValue([makeCampaign('c1', 'u1')])

    const { result } = renderHook(() => useCanManageCampaign('c1'), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(true))
  })

  it('returns false when the campaignId matches no campaign in the list', async () => {
    fetchSession.mockResolvedValue(makeUser({ id: 'u1' }))
    listCampaigns.mockResolvedValue([makeCampaign('c1', 'u1')])

    const { result } = renderHook(() => useCanManageCampaign('c-unknown'), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(false))
  })
})
