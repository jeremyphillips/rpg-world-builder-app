import { describe, expect, it } from 'vitest'

import {
  isCampaignInviteToken,
  parseCampaignInviteTokenSegment,
} from './campaign-invite-token-segment'

const VALID_TOKEN = 'a'.repeat(64)

describe('isCampaignInviteToken', () => {
  it('accepts a 64-char lowercase hex token', () => {
    expect(isCampaignInviteToken(VALID_TOKEN)).toBe(true)
  })

  it('rejects invite ids, uppercase hex, and invalid segments', () => {
    expect(isCampaignInviteToken('a'.repeat(24))).toBe(false)
    expect(isCampaignInviteToken('A'.repeat(64))).toBe(false)
    expect(isCampaignInviteToken(undefined)).toBe(false)
  })
})

describe('parseCampaignInviteTokenSegment', () => {
  it('returns the token for valid segments', () => {
    expect(parseCampaignInviteTokenSegment(VALID_TOKEN)).toBe(VALID_TOKEN)
  })

  it('rejects invite ids and invalid segments', () => {
    expect(parseCampaignInviteTokenSegment('a'.repeat(24))).toBeNull()
    expect(parseCampaignInviteTokenSegment('abc')).toBeNull()
    expect(parseCampaignInviteTokenSegment('')).toBeNull()
  })
})
