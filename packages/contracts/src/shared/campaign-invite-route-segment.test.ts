import { describe, expect, it } from 'vitest'

import { parseCampaignInviteRouteSegment } from './campaign-invite-route-segment'

const VALID_TOKEN = 'a'.repeat(64)
const VALID_INVITE_ID = 'a'.repeat(24)

describe('parseCampaignInviteRouteSegment', () => {
  it('accepts a 64-char lowercase hex token', () => {
    expect(parseCampaignInviteRouteSegment(VALID_TOKEN)).toEqual({
      kind: 'token',
      value: VALID_TOKEN,
    })
  })

  it('accepts a 24-char lowercase hex invite id', () => {
    expect(parseCampaignInviteRouteSegment(VALID_INVITE_ID)).toEqual({
      kind: 'inviteId',
      value: VALID_INVITE_ID,
    })
  })

  it('rejects uppercase hex', () => {
    expect(parseCampaignInviteRouteSegment('A'.repeat(64))).toBeNull()
    expect(parseCampaignInviteRouteSegment('A'.repeat(24))).toBeNull()
  })

  it('rejects ambiguous lengths and invalid charset', () => {
    expect(parseCampaignInviteRouteSegment('abc')).toBeNull()
    expect(parseCampaignInviteRouteSegment('g'.repeat(64))).toBeNull()
    expect(parseCampaignInviteRouteSegment('')).toBeNull()
    expect(parseCampaignInviteRouteSegment('a'.repeat(32))).toBeNull()
  })
})
