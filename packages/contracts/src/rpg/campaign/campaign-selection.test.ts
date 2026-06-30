import { describe, expect, it } from 'vitest'

import { resolveActiveCampaignSummary, resolveLandingCampaignId } from './campaign-selection'

const campaigns = [
  { id: 'a', identity: { name: 'Campaign A' } },
  { id: 'b', identity: { name: 'Campaign B' } },
  { id: 'c', identity: { name: 'Campaign C' } },
]

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

describe('resolveActiveCampaignSummary', () => {
  it('returns id and name for the first valid candidate', () => {
    expect(resolveActiveCampaignSummary(campaigns, ['b', 'a'])).toStrictEqual({
      id: 'b',
      name: 'Campaign B',
    })
  })

  it('returns null when no candidate matches', () => {
    expect(resolveActiveCampaignSummary(campaigns, ['gone'])).toBeNull()
  })

  it('returns null when there are no campaigns', () => {
    expect(resolveActiveCampaignSummary([], ['a'])).toBeNull()
  })
})
