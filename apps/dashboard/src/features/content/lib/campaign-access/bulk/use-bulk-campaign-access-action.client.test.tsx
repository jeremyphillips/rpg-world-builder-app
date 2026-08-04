import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { useBulkCampaignAccessAction } from './use-bulk-campaign-access-action.client'

vi.mock('./bulk-campaign-access-action.lib', () => ({
  validateBulkCampaignAccess: vi.fn(),
  applyBulkCampaignAccessToTargets: vi.fn(),
}))

vi.mock('@/lib/actions/action-outcome-notify.lib', () => ({
  notifyActionOutcomes: vi.fn(),
}))

import {
  applyBulkCampaignAccessToTargets,
  validateBulkCampaignAccess,
} from './bulk-campaign-access-action.lib'

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

describe('useBulkCampaignAccessAction', () => {
  beforeEach(() => {
    vi.mocked(validateBulkCampaignAccess).mockReset()
    vi.mocked(applyBulkCampaignAccessToTargets).mockReset()
  })

  it('returns lifecycle validate and apply helpers', async () => {
    vi.mocked(validateBulkCampaignAccess).mockResolvedValue({
      targets: [{ status: 'eligible', targetId: 'class-1', targetName: 'Wizard' }],
    })
    vi.mocked(applyBulkCampaignAccessToTargets).mockResolvedValue({
      outcomes: [{ status: 'updated', targetId: 'class-1' }],
      updates: [{ rowId: 'class-1', campaignAccess: unavailableAccess }],
    })

    const rows = [
      {
        id: 'class-1',
        name: 'Wizard',
        source: 'system' as const,
        status: 'published' as const,
        campaignAccess: unavailableAccess,
      },
    ]

    const { result } = renderHook(
      () =>
        useBulkCampaignAccessAction({
          campaignId: 'campaign-1',
          contentTypeKey: 'classes',
          rows,
        }),
      { wrapper: createWrapper() },
    )

    await act(async () => {
      await result.current.validate([{ targetId: 'class-1', targetName: 'Wizard' }], {
        available: { kind: 'set', value: true },
        visibilityMode: { kind: 'unchanged' },
      })
    })

    expect(validateBulkCampaignAccess).toHaveBeenCalled()

    await act(async () => {
      const outcomes = await result.current.apply(['class-1'], {
        available: { kind: 'set', value: true },
        visibilityMode: { kind: 'unchanged' },
      })
      expect(outcomes).toEqual([{ status: 'updated', targetId: 'class-1' }])
    })
  })
})
