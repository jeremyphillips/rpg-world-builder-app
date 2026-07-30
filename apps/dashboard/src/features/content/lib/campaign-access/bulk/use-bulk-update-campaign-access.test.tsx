import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { useBulkUpdateCampaignAccess } from './use-bulk-update-campaign-access'

const updateRouteContentCampaignAccess = vi.fn()
const fetchCsrfToken = vi.fn()

vi.mock('@rpg/contracts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@rpg/contracts')>()
  return {
    ...actual,
    fetchCsrfToken: () => fetchCsrfToken(),
  }
})

vi.mock('../campaign-access-api', () => ({
  updateRouteContentCampaignAccess: (...args: unknown[]) =>
    updateRouteContentCampaignAccess(...args),
}))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const unavailableAccess = {
  ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  available: false,
  effectiveAudience: 'none' as const,
}

describe('useBulkUpdateCampaignAccess', () => {
  beforeEach(() => {
    updateRouteContentCampaignAccess.mockReset()
    fetchCsrfToken.mockReset()
    fetchCsrfToken.mockResolvedValue('shared-csrf-token')
  })

  it('aggregates partial success with blocked rows', async () => {
    updateRouteContentCampaignAccess
      .mockResolvedValueOnce({
        status: 'updated',
        campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      })
      .mockResolvedValueOnce({
        status: 'blocked',
        blockers: [{ kind: 'usage', characterId: 'char-1', characterName: 'Aldric' }],
      })

    const { result } = renderHook(
      () =>
        useBulkUpdateCampaignAccess({
          campaignId: 'campaign-1',
          contentTypeKey: 'classes',
        }),
      { wrapper: createWrapper() },
    )

    let applyResult: Awaited<ReturnType<typeof result.current.apply>> | undefined

    await act(async () => {
      applyResult = await result.current.apply(
        [
          {
            id: 'class-1',
            name: 'Wizard',
            source: 'system',
            status: 'published',
            campaignAccess: unavailableAccess,
          },
          {
            id: 'class-2',
            name: 'Fighter',
            source: 'system',
            status: 'published',
            campaignAccess: unavailableAccess,
          },
        ],
        {
          available: { kind: 'set', value: true },
          visibilityMode: { kind: 'unchanged' },
        },
      )
    })

    expect(applyResult).toMatchObject({
      updatedIds: ['class-1'],
      blockedIds: ['class-2'],
      fullSuccess: false,
      summary: 'Updated 1 item. 1 item blocked.',
    })
  })

  it('applies all selected rows when every update succeeds', async () => {
    updateRouteContentCampaignAccess.mockResolvedValue({
      status: 'updated',
      campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    })

    const { result } = renderHook(
      () =>
        useBulkUpdateCampaignAccess({
          campaignId: 'campaign-1',
          contentTypeKey: 'classes',
        }),
      { wrapper: createWrapper() },
    )

    let applyResult: Awaited<ReturnType<typeof result.current.apply>> | undefined

    await act(async () => {
      applyResult = await result.current.apply(
        [
          {
            id: 'class-1',
            name: 'Wizard',
            source: 'system',
            status: 'published',
            campaignAccess: unavailableAccess,
          },
          {
            id: 'class-2',
            name: 'Fighter',
            source: 'system',
            status: 'published',
            campaignAccess: unavailableAccess,
          },
          {
            id: 'class-3',
            name: 'Rogue',
            source: 'system',
            status: 'published',
            campaignAccess: unavailableAccess,
          },
        ],
        {
          available: { kind: 'set', value: true },
          visibilityMode: { kind: 'unchanged' },
        },
      )
    })

    expect(applyResult).toMatchObject({
      updatedIds: ['class-1', 'class-2', 'class-3'],
      blockedIds: [],
      failedIds: [],
      fullSuccess: true,
      summary: '3 items are now available in this campaign.',
    })
    expect(updateRouteContentCampaignAccess).toHaveBeenCalledTimes(3)
  })
})
