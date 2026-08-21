import { describe, expect, it } from 'vitest'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import {
  mapCampaignTopbarTitleState,
  resolveCampaignTopbarTitleState,
} from './resolve-campaign-topbar-title-state'
import { CAMPAIGN_UNKNOWN_NAME, CAMPAIGNS_QUERY_ERROR_MESSAGE } from '../campaign-display'

describe('resolveCampaignTopbarTitleState', () => {
  it('returns hidden when the route has no campaign id', () => {
    expect(
      resolveCampaignTopbarTitleState(undefined, {
        isPending: false,
        isError: false,
        data: [],
      }),
    ).toEqual({ kind: 'hidden' })
  })

  it('returns loading while the campaigns query is unresolved', () => {
    expect(
      resolveCampaignTopbarTitleState('camp_1', {
        isPending: true,
        isError: false,
        data: undefined,
      }),
    ).toEqual({ kind: 'loading' })

    expect(
      resolveCampaignTopbarTitleState('camp_1', {
        isPending: false,
        isError: false,
        data: undefined,
      }),
    ).toEqual({ kind: 'loading' })
  })

  it('returns error when the campaigns query fails', () => {
    expect(
      resolveCampaignTopbarTitleState('camp_1', {
        isPending: false,
        isError: true,
        data: undefined,
      }),
    ).toEqual({ kind: 'error' })
  })

  it('returns resolved when the campaign is present', () => {
    expect(
      resolveCampaignTopbarTitleState('camp_1', {
        isPending: false,
        isError: false,
        data: [makeCampaignListItem({ id: 'camp_1', identity: { name: 'The Argent Road' } })],
      }),
    ).toEqual({
      kind: 'resolved',
      campaignId: 'camp_1',
      name: 'The Argent Road',
    })
  })

  it('returns missing only after a successful query omits the id', () => {
    expect(
      resolveCampaignTopbarTitleState('camp_missing', {
        isPending: false,
        isError: false,
        data: [makeCampaignListItem({ id: 'camp_1' })],
      }),
    ).toEqual({ kind: 'missing', campaignId: 'camp_missing' })
  })
})

describe('mapCampaignTopbarTitleState', () => {
  it('adds campaign detail hrefs for resolved and missing states', () => {
    expect(
      mapCampaignTopbarTitleState({
        kind: 'resolved',
        campaignId: 'camp_1',
        name: 'The Argent Road',
      }),
    ).toEqual({
      kind: 'resolved',
      display: {
        id: 'camp_1',
        name: 'The Argent Road',
        imageUrl: null,
      },
      href: '/campaigns/camp_1',
    })

    expect(
      mapCampaignTopbarTitleState({
        kind: 'missing',
        campaignId: 'camp_missing',
      }),
    ).toEqual({
      kind: 'missing',
      campaignId: 'camp_missing',
      href: '/campaigns/camp_missing',
      name: CAMPAIGN_UNKNOWN_NAME,
    })
  })

  it('passes through error state for visible topbar copy', () => {
    expect(mapCampaignTopbarTitleState({ kind: 'error' })).toEqual({ kind: 'error' })
  })
})

describe('campaign query copy constants', () => {
  it('uses shared unknown and error labels', () => {
    expect(CAMPAIGN_UNKNOWN_NAME).toBe('Unknown campaign')
    expect(CAMPAIGNS_QUERY_ERROR_MESSAGE).toBe("Couldn't load campaigns")
  })
})
