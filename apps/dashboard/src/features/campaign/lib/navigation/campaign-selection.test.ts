import { describe, expect, it } from 'vitest'
import type { CampaignListItem } from '@rpg/contracts'

import {
  getCampaignSwitcherLabel,
  resolveContinueCampaign,
  resolveLandingPath,
  resolveTargetPathOnSwitch,
} from './campaign-selection'

const campaigns = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

const campaignListItems = [
  { id: 'a', viewerOnboardingState: 'complete', identity: { name: 'A' } },
  { id: 'b', viewerOnboardingState: 'complete', identity: { name: 'B' } },
  { id: 'c', viewerOnboardingState: 'incomplete', identity: { name: 'C' } },
] as CampaignListItem[]

describe('resolveLandingPath', () => {
  it('prefers the stored id over the server preference', () => {
    expect(resolveLandingPath(campaigns, { lastSelectedCampaignId: 'a' }, 'b')).toBe('/campaigns/b')
  })

  it('falls back to the server preference when nothing is stored', () => {
    expect(resolveLandingPath(campaigns, { lastSelectedCampaignId: 'c' }, null)).toBe(
      '/campaigns/c',
    )
  })

  it('defaults to the only campaign when the user has exactly one', () => {
    expect(resolveLandingPath([{ id: 'solo' }], null, null)).toBe('/campaigns/solo')
  })

  it('returns null when multiple campaigns and no valid preference', () => {
    expect(resolveLandingPath(campaigns, { lastSelectedCampaignId: null }, null)).toBeNull()
  })

  it('ignores a stored/preferred id that is no longer a campaign', () => {
    expect(resolveLandingPath(campaigns, { lastSelectedCampaignId: 'gone' }, 'stale')).toBeNull()
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
          {
            id: 'solo',
            viewerOnboardingState: 'complete',
            identity: { name: 'Solo' },
          } as CampaignListItem,
        ],
        null,
        null,
      ),
    ).toMatchObject({ id: 'solo' })
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

describe('getCampaignSwitcherLabel', () => {
  it('shows an error label on failure', () => {
    expect(getCampaignSwitcherLabel({ isError: true })).toBe('Couldn’t load campaigns')
  })

  it('shows the active campaign name when available', () => {
    expect(getCampaignSwitcherLabel({ isError: false, activeName: 'Sunless Citadel' })).toBe(
      'Sunless Citadel',
    )
  })

  it('falls back to a prompt when no campaign is active', () => {
    expect(getCampaignSwitcherLabel({ isError: false })).toBe('Select campaign')
  })
})
