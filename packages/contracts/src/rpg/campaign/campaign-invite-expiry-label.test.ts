import { describe, expect, it } from 'vitest'

import { resolveCampaignInviteExpiryLabel } from './campaign-invite-expiry-label'

describe('resolveCampaignInviteExpiryLabel', () => {
  it('uses relative copy when the deadline is near', () => {
    const now = new Date('2026-07-30T12:00:00.000Z')

    expect(resolveCampaignInviteExpiryLabel('2026-07-30T23:59:59.000Z', now)).toBe('Expires today')
    expect(resolveCampaignInviteExpiryLabel('2026-07-31T23:59:59.000Z', now)).toBe(
      'Expires tomorrow',
    )
    expect(resolveCampaignInviteExpiryLabel('2026-08-02T23:59:59.000Z', now)).toBe(
      'Expires in 3 days',
    )
  })

  it('uses an absolute date when the deadline is far out', () => {
    const now = new Date('2026-07-30T12:00:00.000Z')

    expect(resolveCampaignInviteExpiryLabel('2026-09-15T00:00:00.000Z', now)).toMatch(
      /^Expires September 14|^Expires September 15/,
    )
  })
})
