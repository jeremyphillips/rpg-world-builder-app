import { describe, expect, it } from 'vitest'

import {
  campaignInviteOnboardingContextSchema,
  campaignInvitePublicResolutionSchema,
} from './campaign-invite-dtos'

describe('campaignInviteOnboardingContextSchema', () => {
  it('parses accepted onboarding context', () => {
    const parsed = campaignInviteOnboardingContextSchema.parse({
      status: 'accepted',
      inviteId: 'invite_1',
      campaign: { id: 'camp_1', name: 'The Shattered Vale' },
      membership: { id: 'mem_1', role: 'pc' },
      startingLevel: 3,
      expiresAt: '2026-01-08T00:00:00.000Z',
    })

    expect(parsed.status).toBe('accepted')
  })

  it('parses completed onboarding context for redirect recovery', () => {
    const parsed = campaignInviteOnboardingContextSchema.parse({
      status: 'completed',
      campaignId: 'camp_1',
      characterId: 'char_1',
    })

    expect(parsed.status).toBe('completed')
    if (parsed.status === 'completed') {
      expect(parsed.characterId).toBe('char_1')
    }
  })
})

describe('campaignInvitePublicResolutionSchema', () => {
  it('parses public resolve payload without internal ids', () => {
    const parsed = campaignInvitePublicResolutionSchema.parse({
      campaignName: 'The Shattered Vale',
      inviterDisplayName: 'A campaign owner',
      invitedEmailMasked: 'p***@example.com',
      status: 'pending',
      expiresAt: '2026-01-08T00:00:00.000Z',
    })

    expect(parsed.invitedEmailMasked).toBe('p***@example.com')
  })
})
