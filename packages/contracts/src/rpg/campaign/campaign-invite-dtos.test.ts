import { describe, expect, it } from 'vitest'

import { campaignInvitePublicResolutionSchema } from './campaign-invite-dtos'

describe('campaignInvitePublicResolutionSchema', () => {
  it('parses public resolve payload without internal ids', () => {
    const parsed = campaignInvitePublicResolutionSchema.parse({
      campaignName: 'The Shattered Vale',
      inviterDisplayName: 'A campaign owner',
      invitedEmail: 'player@example.com',
      invitedEmailMasked: 'p***@example.com',
      status: 'pending',
      expiresAt: '2026-01-08T00:00:00.000Z',
    })

    expect(parsed.invitedEmail).toBe('player@example.com')
    expect(parsed.invitedEmailMasked).toBe('p***@example.com')
  })
})
