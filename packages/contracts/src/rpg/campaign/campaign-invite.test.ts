import { describe, expect, it } from 'vitest'

import {
  CAMPAIGN_INVITE_EXPIRY_DAYS,
  campaignInviteEmailsInputSchema,
  campaignInviteRecipientInputSchema,
  campaignInviteSchema,
} from './campaign-invite'

const timestamps = {
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

const baseInvite = {
  id: 'invite_1',
  campaignId: 'camp_1',
  email: 'player@example.com',
  normalizedEmail: 'player@example.com',
  status: 'pending',
  deliveryStatus: 'pending',
  tokenHash: 'a'.repeat(64),
  expiresAt: '2026-01-08T00:00:00.000Z',
  invitedByUserId: 'user_owner',
  deliveryAttempts: 0,
  ...timestamps,
} as const

describe('campaignInviteSchema', () => {
  it('parses a minimal pending invite', () => {
    const parsed = campaignInviteSchema.parse(baseInvite)
    expect(parsed.status).toBe('pending')
    expect(parsed.completedCharacterId).toBeUndefined()
  })

  it('parses accepted and completed lifecycle fields', () => {
    const parsed = campaignInviteSchema.parse({
      ...baseInvite,
      status: 'completed',
      deliveryStatus: 'sent',
      acceptedByUserId: 'user_player',
      acceptedAt: '2026-01-02T00:00:00.000Z',
      completedAt: '2026-01-03T00:00:00.000Z',
      completedCharacterId: 'char_1',
      sentAt: '2026-01-01T00:05:00.000Z',
      deliveryAttempts: 1,
      lastDeliveryAttemptAt: '2026-01-01T00:05:00.000Z',
    })

    expect(parsed.completedCharacterId).toBe('char_1')
    expect(parsed.deliveryAttempts).toBe(1)
  })

  it('rejects invites without tokenHash', () => {
    const { tokenHash: _tokenHash, ...withoutHash } = baseInvite
    expect(campaignInviteSchema.safeParse(withoutHash).success).toBe(false)
  })
})

describe('campaign invite input schemas', () => {
  it('validates recipient email input', () => {
    expect(campaignInviteRecipientInputSchema.parse({ email: 'player@example.com' }).email).toBe(
      'player@example.com',
    )
  })

  it('caps campaign creation invite batch at 10', () => {
    const emails = Array.from({ length: 11 }, (_, index) => ({
      email: `player${index}@example.com`,
    }))
    expect(campaignInviteEmailsInputSchema.safeParse(emails).success).toBe(false)
  })

  it('exports invite expiry constant', () => {
    expect(CAMPAIGN_INVITE_EXPIRY_DAYS).toBe(7)
  })
})
