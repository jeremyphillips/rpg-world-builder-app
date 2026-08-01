import { describe, expect, it } from 'vitest'

import { isCampaignInviteId } from './campaign-invite-id'

const VALID_INVITE_ID = 'a'.repeat(24)

describe('isCampaignInviteId', () => {
  it('accepts a 24-char lowercase hex id', () => {
    expect(isCampaignInviteId(VALID_INVITE_ID)).toBe(true)
  })

  it('rejects uppercase hex, wrong lengths, and invalid charset', () => {
    expect(isCampaignInviteId('A'.repeat(24))).toBe(false)
    expect(isCampaignInviteId('abc')).toBe(false)
    expect(isCampaignInviteId('a'.repeat(64))).toBe(false)
    expect(isCampaignInviteId(undefined)).toBe(false)
  })
})
