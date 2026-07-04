import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

import { makeQueryWrapper } from '@/test/make-wrapper'

vi.mock('@/features/auth')
vi.mock('@/features/campaign/api/campaign-client')

import { useSession as useSessionFn } from '@/features/auth'
import { listCampaigns as listCampaignsFn } from '@/features/campaign/api/campaign-client'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'
import { makeAuthMe, makeSessionUser } from '@/test/fixtures/session'
import { useCanManageCampaign } from './use-can-manage-campaign'

const useSession = vi.mocked(useSessionFn)
const listCampaigns = vi.mocked(listCampaignsFn)

describe('useCanManageCampaign', () => {
  beforeEach(() => {
    useSession.mockReset()
    listCampaigns.mockReset()
  })

  it('returns false when no campaignId is provided', async () => {
    useSession.mockReturnValue({ data: makeAuthMe(makeSessionUser()) } as ReturnType<
      typeof useSessionFn
    >)
    listCampaigns.mockResolvedValue([makeCampaignListItem({ id: 'c1', campaignRole: 'owner' })])

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
    useSession.mockReturnValue({ data: makeAuthMe(makeSessionUser({ id: 'u1' })) } as ReturnType<
      typeof useSessionFn
    >)
    listCampaigns.mockResolvedValue([makeCampaignListItem({ id: 'c1', campaignRole: 'pc' })])

    const { result } = renderHook(() => useCanManageCampaign('c1'), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(false))
  })

  it('returns true when the user is the campaign owner', async () => {
    useSession.mockReturnValue({ data: makeAuthMe(makeSessionUser({ id: 'u1' })) } as ReturnType<
      typeof useSessionFn
    >)
    listCampaigns.mockResolvedValue([makeCampaignListItem({ id: 'c1', campaignRole: 'owner' })])

    const { result } = renderHook(() => useCanManageCampaign('c1'), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(true))
  })

  it('returns true when the user is a co-owner', async () => {
    useSession.mockReturnValue({ data: makeAuthMe(makeSessionUser({ id: 'u2' })) } as ReturnType<
      typeof useSessionFn
    >)
    listCampaigns.mockResolvedValue([makeCampaignListItem({ id: 'c1', campaignRole: 'co-owner' })])

    const { result } = renderHook(() => useCanManageCampaign('c1'), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(true))
  })

  it('returns false when the campaignId matches no campaign in the list', async () => {
    useSession.mockReturnValue({ data: makeAuthMe(makeSessionUser({ id: 'u1' })) } as ReturnType<
      typeof useSessionFn
    >)
    listCampaigns.mockResolvedValue([makeCampaignListItem({ id: 'c1', campaignRole: 'owner' })])

    const { result } = renderHook(() => useCanManageCampaign('c-unknown'), {
      wrapper: makeQueryWrapper(),
    })

    await waitFor(() => expect(result.current).toBe(false))
  })
})
