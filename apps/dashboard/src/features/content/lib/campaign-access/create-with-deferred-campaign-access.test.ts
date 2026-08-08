import { describe, expect, it, vi, beforeEach } from 'vitest'
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { createWithDeferredCampaignAccess } from './create-with-deferred-campaign-access'

const updateRouteContentCampaignAccess = vi.fn()

vi.mock('./campaign-access-api', () => ({
  updateRouteContentCampaignAccess: (...args: unknown[]) =>
    updateRouteContentCampaignAccess(...args),
}))

describe('createWithDeferredCampaignAccess', () => {
  beforeEach(() => {
    updateRouteContentCampaignAccess.mockReset()
  })

  it('creates without PATCH when campaign access draft is default', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: 'location-new' })

    const result = await createWithDeferredCampaignAccess({
      campaignId: 'campaign-1',
      routeKey: 'locations',
      createInput: { name: 'New place', status: 'published' },
      mutateAsync,
      pendingAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    })

    expect(mutateAsync).toHaveBeenCalledOnce()
    expect(updateRouteContentCampaignAccess).not.toHaveBeenCalled()
    expect(result).toEqual({ entity: { id: 'location-new' }, deferredAccessFailed: false })
  })

  it('PATCHes campaign access after create when draft is non-default', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: 'location-new' })
    updateRouteContentCampaignAccess.mockResolvedValue(undefined)
    const pendingAccess = {
      ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      available: false,
    }

    const result = await createWithDeferredCampaignAccess({
      campaignId: 'campaign-1',
      routeKey: 'locations',
      createInput: { name: 'Hidden place', status: 'published' },
      mutateAsync,
      pendingAccess,
    })

    expect(updateRouteContentCampaignAccess).toHaveBeenCalledWith(
      'campaign-1',
      'locations',
      'location-new',
      pendingAccess,
    )
    expect(result.deferredAccessFailed).toBe(false)
  })

  it('returns deferredAccessFailed when PATCH fails', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: 'location-new' })
    updateRouteContentCampaignAccess.mockRejectedValue(new Error('network'))

    const result = await createWithDeferredCampaignAccess({
      campaignId: 'campaign-1',
      routeKey: 'locations',
      createInput: { name: 'Hidden place', status: 'published' },
      mutateAsync,
      pendingAccess: {
        ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
        available: false,
      },
    })

    expect(result.deferredAccessFailed).toBe(true)
    expect(result.entity).toEqual({ id: 'location-new' })
  })
})
