import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import type { AuthMeResponse, CampaignListItem, SessionUser } from '@rpg/contracts'

import { makeQueryWrapper } from '@/test/make-wrapper'

vi.mock('@/features/auth')
vi.mock('@/features/campaign/api/campaign-client')

import { useSession as useSessionFn } from '@/features/auth'
import { listCampaigns as listCampaignsFn } from '@/features/campaign/api/campaign-client'
import { useCanManageCampaign } from './use-can-manage-campaign'

const useSession = vi.mocked(useSessionFn)
const listCampaigns = vi.mocked(listCampaignsFn)

function authMe(user: SessionUser): AuthMeResponse {
  return { user, activeCampaign: null }
}

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

function makeCampaign(
  id: string,
  campaignRole: CampaignListItem['campaignRole'],
): CampaignListItem {
  return {
    id,
    identity: { name: 'Test Campaign' },
    configuration: {},
    status: 'active',
    visibility: 'private',
    rulesetId: 'srd-cc-5.2.1',
    createdBy: 'u1',
    campaignRole,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('useCanManageCampaign', () => {
  beforeEach(() => {
    useSession.mockReset()
    listCampaigns.mockReset()
  })

  it('returns false when no campaignId is provided', async () => {
    useSession.mockReturnValue({ data: authMe(makeUser()) } as ReturnType<typeof useSessionFn>)
    listCampaigns.mockResolvedValue([makeCampaign('c1', 'owner')])

    const { result } = renderHook(() => useCanManageCampaign(undefined), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(false))
  })

  it('returns false when the session is still loading', async () => {
    useSession.mockReturnValue({ data: undefined } as ReturnType<typeof useSessionFn>)
    listCampaigns.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useCanManageCampaign('c1'), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(false))
  })

  it('returns false when the user is a player', async () => {
    useSession.mockReturnValue({ data: authMe(makeUser({ id: 'u1' })) } as ReturnType<
      typeof useSessionFn
    >)
    listCampaigns.mockResolvedValue([makeCampaign('c1', 'pc')])

    const { result } = renderHook(() => useCanManageCampaign('c1'), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(false))
  })

  it('returns true when the user is the campaign owner', async () => {
    useSession.mockReturnValue({ data: authMe(makeUser({ id: 'u1' })) } as ReturnType<
      typeof useSessionFn
    >)
    listCampaigns.mockResolvedValue([makeCampaign('c1', 'owner')])

    const { result } = renderHook(() => useCanManageCampaign('c1'), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(true))
  })

  it('returns true when the user is a co-owner', async () => {
    useSession.mockReturnValue({ data: authMe(makeUser({ id: 'u2' })) } as ReturnType<
      typeof useSessionFn
    >)
    listCampaigns.mockResolvedValue([makeCampaign('c1', 'co-owner')])

    const { result } = renderHook(() => useCanManageCampaign('c1'), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(true))
  })

  it('returns false when the campaignId matches no campaign in the list', async () => {
    useSession.mockReturnValue({ data: authMe(makeUser({ id: 'u1' })) } as ReturnType<
      typeof useSessionFn
    >)
    listCampaigns.mockResolvedValue([makeCampaign('c1', 'owner')])

    const { result } = renderHook(() => useCanManageCampaign('c-unknown'), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(false))
  })
})
