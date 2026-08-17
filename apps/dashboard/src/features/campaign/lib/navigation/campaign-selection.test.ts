import { describe, expect, it } from 'vitest'

import { makeCampaignListItem, VIEWER_STATE } from '@/test/fixtures/campaigns'

import { CAMPAIGN_UNKNOWN_NAME, CAMPAIGNS_QUERY_ERROR_MESSAGE } from '../campaign-display'
import {
  CAMPAIGN_SWITCHER_NO_SELECTION_LABEL,
  getCampaignSwitcherTriggerLabel,
  resolveCampaignSwitcherTriggerState,
  resolveContinueCampaign,
  resolveResumeSetupCampaign,
  resolveTargetPathOnSwitch,
} from './campaign-selection'
import { resolvePreferredCampaignId } from './resolve-preferred-campaign-id'

const campaigns = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

const campaignListItems = [
  makeCampaignListItem({ id: 'a', viewerState: VIEWER_STATE.ready, identity: { name: 'A' } }),
  makeCampaignListItem({ id: 'b', viewerState: VIEWER_STATE.ready, identity: { name: 'B' } }),
  makeCampaignListItem({
    id: 'c',
    viewerState: VIEWER_STATE.onboardingIncomplete,
    identity: { name: 'C' },
  }),
]

describe('resolvePreferredCampaignId', () => {
  it('prefers the stored id over the server preference', () => {
    expect(resolvePreferredCampaignId(campaigns, { lastSelectedCampaignId: 'a' }, 'b')).toBe('b')
  })

  it('falls back to the server preference when nothing is stored', () => {
    expect(resolvePreferredCampaignId(campaigns, { lastSelectedCampaignId: 'c' }, null)).toBe('c')
  })

  it('defaults to the only campaign when the user has exactly one', () => {
    expect(resolvePreferredCampaignId([{ id: 'solo' }], null, null)).toBe('solo')
  })

  it('returns null when multiple campaigns and no valid preference', () => {
    expect(resolvePreferredCampaignId(campaigns, { lastSelectedCampaignId: null }, null)).toBeNull()
  })

  it('ignores a stored/preferred id that is no longer a campaign', () => {
    expect(
      resolvePreferredCampaignId(campaigns, { lastSelectedCampaignId: 'gone' }, 'stale'),
    ).toBeNull()
  })
})

describe('resolveContinueCampaign', () => {
  it('returns the preferred campaign when it exists and onboarding is complete', () => {
    expect(
      resolveContinueCampaign(campaignListItems, { lastSelectedCampaignId: 'a' }, 'b'),
    ).toMatchObject({ id: 'b' })
  })

  it('returns null when the resolved campaign has incomplete onboarding', () => {
    expect(
      resolveContinueCampaign(campaignListItems, { lastSelectedCampaignId: 'c' }, null),
    ).toBeNull()
  })

  it('returns null when the stored id is not in the campaigns query', () => {
    expect(resolveContinueCampaign(campaignListItems, null, 'gone')).toBeNull()
  })

  it('returns the sole campaign when valid', () => {
    expect(
      resolveContinueCampaign(
        [
          makeCampaignListItem({
            id: 'solo',
            viewerState: VIEWER_STATE.ready,
            identity: { name: 'Solo' },
          }),
        ],
        null,
        null,
      ),
    ).toMatchObject({ id: 'solo' })
  })
})

describe('resolveResumeSetupCampaign', () => {
  it('returns the preferred campaign when onboarding is incomplete', () => {
    expect(
      resolveResumeSetupCampaign(campaignListItems, { lastSelectedCampaignId: 'c' }, null),
    ).toMatchObject({ id: 'c' })
  })

  it('returns null when onboarding is complete', () => {
    expect(
      resolveResumeSetupCampaign(campaignListItems, { lastSelectedCampaignId: 'a' }, 'b'),
    ).toBeNull()
  })
})

describe('resolveTargetPathOnSwitch', () => {
  it('substitutes the campaign id on the detail route', () => {
    expect(resolveTargetPathOnSwitch('/campaigns/abc', 'abc', 'xyz')).toBe('/campaigns/xyz')
  })

  it('preserves a single section segment', () => {
    expect(resolveTargetPathOnSwitch('/campaigns/abc/sessions', 'abc', 'xyz')).toBe(
      '/campaigns/xyz/sessions',
    )
  })

  it('strips entity ids deeper than one section segment', () => {
    expect(resolveTargetPathOnSwitch('/campaigns/abc/sessions/123', 'abc', 'xyz')).toBe(
      '/campaigns/xyz/sessions',
    )
  })

  it('falls back to the campaign detail when the pathname does not match', () => {
    expect(resolveTargetPathOnSwitch('/characters', 'abc', 'xyz')).toBe('/campaigns/xyz')
  })
})

describe('resolveCampaignSwitcherTriggerState', () => {
  const loadedQuery = {
    isPending: false,
    isError: false,
    data: [makeCampaignListItem({ id: 'camp_1', identity: { name: 'Sunless Citadel' } })],
  }

  it('returns error on query failure', () => {
    expect(
      resolveCampaignSwitcherTriggerState('camp_1', {
        isPending: false,
        isError: true,
        data: undefined,
      }),
    ).toEqual({ kind: 'error' })
  })

  it('returns missing when the active id is absent after a successful query', () => {
    expect(resolveCampaignSwitcherTriggerState('camp_missing', loadedQuery)).toEqual({
      kind: 'missing',
    })
  })

  it('returns resolved when the campaign is present', () => {
    expect(resolveCampaignSwitcherTriggerState('camp_1', loadedQuery)).toEqual({
      kind: 'resolved',
      campaign: loadedQuery.data[0],
    })
  })

  it('returns noSelection when there is no active id', () => {
    expect(resolveCampaignSwitcherTriggerState(null, loadedQuery)).toEqual({ kind: 'noSelection' })
  })
})

describe('getCampaignSwitcherTriggerLabel', () => {
  it('maps switcher states to shared copy', () => {
    expect(getCampaignSwitcherTriggerLabel({ kind: 'error' })).toBe(CAMPAIGNS_QUERY_ERROR_MESSAGE)
    expect(getCampaignSwitcherTriggerLabel({ kind: 'noSelection' })).toBe(
      CAMPAIGN_SWITCHER_NO_SELECTION_LABEL,
    )
    expect(getCampaignSwitcherTriggerLabel({ kind: 'missing' })).toBe(CAMPAIGN_UNKNOWN_NAME)
  })
})
