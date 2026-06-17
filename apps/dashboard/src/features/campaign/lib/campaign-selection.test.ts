import { describe, expect, it } from 'vitest'

import {
  getCampaignSwitcherLabel,
  resolveLandingCampaignId,
  resolveLandingPath,
  resolveTargetPathOnSwitch,
} from './campaign-selection'

const campaigns = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

describe('resolveLandingCampaignId', () => {
  it('returns the first candidate that is a known campaign', () => {
    expect(resolveLandingCampaignId(campaigns, ['b', 'a'])).toBe('b')
  })

  it('skips invalid/empty candidates and honors priority order', () => {
    expect(resolveLandingCampaignId(campaigns, [null, undefined, 'unknown', 'c'])).toBe('c')
  })

  it('returns null when no candidate matches a campaign', () => {
    expect(resolveLandingCampaignId(campaigns, ['x', null])).toBeNull()
  })

  it('returns null when there are no campaigns', () => {
    expect(resolveLandingCampaignId([], ['a'])).toBeNull()
  })
})

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
  it('shows a loading label while pending', () => {
    expect(getCampaignSwitcherLabel({ isPending: true, isError: false })).toBe('Loading campaigns…')
  })

  it('shows an error label on failure', () => {
    expect(getCampaignSwitcherLabel({ isPending: false, isError: true })).toBe(
      'Couldn’t load campaigns',
    )
  })

  it('shows the active campaign name when available', () => {
    expect(
      getCampaignSwitcherLabel({ isPending: false, isError: false, activeName: 'Sunless Citadel' }),
    ).toBe('Sunless Citadel')
  })

  it('falls back to a prompt when no campaign is active', () => {
    expect(getCampaignSwitcherLabel({ isPending: false, isError: false })).toBe('Select campaign')
  })
})
