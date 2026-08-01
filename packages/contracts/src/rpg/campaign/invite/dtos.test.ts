import { describe, expect, it } from 'vitest'

import {
  campaignInviteInviteeListItemSchema,
  campaignInviteInviteeListResponseSchema,
} from './dtos'

describe('campaignInviteInviteeListItemSchema', () => {
  it('parses pending invite list items for the invitee dashboard', () => {
    const parsed = campaignInviteInviteeListItemSchema.parse({
      inviteId: 'invite_1',
      campaignId: 'camp_1',
      campaignName: 'The Shattered Vale',
      inviterDisplayName: 'Avery',
      expiresAt: '2026-01-08T00:00:00.000Z',
    })

    expect(parsed.campaignName).toBe('The Shattered Vale')
  })
})

describe('campaignInviteInviteeListResponseSchema', () => {
  it('wraps invite list items', () => {
    const parsed = campaignInviteInviteeListResponseSchema.parse({ invites: [] })
    expect(parsed.invites).toEqual([])
  })
})
