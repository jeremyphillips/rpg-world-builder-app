import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ROUTES } from '@/app/routes'

import { useMessagesCampaignScopeEffects } from './use-messages-campaign-scope-effects'

const navigate = vi.fn()
const useConversations = vi.fn()

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate,
  useLocation: () => ({ search: '?campaignId=camp_1', pathname: '/messages' }),
}))

vi.mock('../hooks/use-conversations', () => ({
  useConversations: (...args: unknown[]) => useConversations(...args),
}))

describe('useMessagesCampaignScopeEffects', () => {
  beforeEach(() => {
    navigate.mockReset()
    useConversations.mockReturnValue({
      data: {
        scopeInvalid: true,
        items: [],
        nextCursor: null,
      },
    })
  })

  it('strips invalid campaign scope and surfaces the quiet notice', async () => {
    const { result } = renderHook(() =>
      useMessagesCampaignScopeEffects({
        campaignId: 'camp_1',
        isNewRoute: false,
        isThreadRoute: false,
        routeConversationId: undefined,
      }),
    )

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(ROUTES.messages.list, { replace: true })
    })

    expect(result.current.showInvalidScopeNotice).toBe(true)
  })

  it('preserves thread paths when stripping invalid scope from an open conversation', async () => {
    vi.mocked(useConversations).mockReturnValue({
      data: {
        scopeInvalid: true,
        items: [],
        nextCursor: null,
      },
    })

    renderHook(() =>
      useMessagesCampaignScopeEffects({
        campaignId: 'camp_1',
        isNewRoute: false,
        isThreadRoute: true,
        routeConversationId: 'conv_1',
      }),
    )

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(ROUTES.messages.detail('conv_1'), { replace: true })
    })
  })

  it('resets the invalid scope notice when the campaign filter changes', async () => {
    const { result, rerender } = renderHook(
      (campaignId: string | undefined) =>
        useMessagesCampaignScopeEffects({
          campaignId,
          isNewRoute: false,
          isThreadRoute: false,
          routeConversationId: undefined,
        }),
      { initialProps: 'camp_1' as string | undefined },
    )

    await waitFor(() => {
      expect(result.current.showInvalidScopeNotice).toBe(true)
    })

    useConversations.mockReturnValue({
      data: {
        scope: { campaignId: 'camp_2', campaignName: 'Stormwatch' },
        scopedCount: 3,
        hiddenCount: 1,
        items: [{ id: 'conv_1' }],
        nextCursor: null,
      },
    })

    rerender('camp_2')

    await waitFor(() => {
      expect(result.current.showInvalidScopeNotice).toBe(false)
    })
  })

  it('dismisses the invalid scope notice without navigating again', () => {
    const { result } = renderHook(() =>
      useMessagesCampaignScopeEffects({
        campaignId: 'camp_1',
        isNewRoute: false,
        isThreadRoute: false,
        routeConversationId: undefined,
      }),
    )

    act(() => {
      result.current.dismissInvalidScopeNotice()
    })

    expect(result.current.showInvalidScopeNotice).toBe(false)
  })
})
