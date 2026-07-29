import { describe, expect, it } from 'vitest'

import { resolveActiveCampaignId } from './resolve-active-campaign-id'

describe('resolveActiveCampaignId', () => {
  it('prefers the route campaign id when present', () => {
    expect(
      resolveActiveCampaignId({
        routeCampaignId: 'route-camp',
        preferredCampaignId: 'preferred-camp',
      }),
    ).toBe('route-camp')
  })

  it('falls back to the preferred campaign on agnostic routes', () => {
    expect(
      resolveActiveCampaignId({
        routeCampaignId: undefined,
        preferredCampaignId: 'preferred-camp',
      }),
    ).toBe('preferred-camp')
  })

  it('returns null when neither source is set', () => {
    expect(
      resolveActiveCampaignId({
        routeCampaignId: null,
        preferredCampaignId: null,
      }),
    ).toBeNull()
  })
})
