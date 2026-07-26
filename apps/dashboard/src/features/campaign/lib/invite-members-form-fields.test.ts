import { describe, expect, it } from 'vitest'

import { buildCreateCampaignInput } from './campaign-settings-form-values'
import { inviteMembersSchema } from './invite-members-form-fields'

describe('inviteMembersSchema', () => {
  it('allows an empty invite list', () => {
    expect(inviteMembersSchema.safeParse({ inviteEmails: [{ email: '' }] }).success).toBe(true)
  })

  it('rejects duplicate email addresses', () => {
    const result = inviteMembersSchema.safeParse({
      inviteEmails: [{ email: 'player@example.com' }, { email: 'player@example.com' }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Duplicate email addresses are not allowed.')
    }
  })

  it('rejects invalid email addresses', () => {
    const result = inviteMembersSchema.safeParse({
      inviteEmails: [{ email: 'not-an-email' }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Enter a valid email address.')
    }
  })

  it('rejects more than ten recipients', () => {
    const inviteEmails = Array.from({ length: 11 }, (_, index) => ({
      email: `player${index}@example.com`,
    }))

    expect(inviteMembersSchema.safeParse({ inviteEmails }).success).toBe(false)
  })
})

describe('buildCreateCampaignInput invite emails', () => {
  it('omits inviteEmails when every row is blank', () => {
    expect(
      buildCreateCampaignInput({
        name: 'The Sunless Citadel',
        inviteEmails: [{ email: '' }, { email: '   ' }],
      } as never),
    ).not.toHaveProperty('inviteEmails')
  })

  it('trims and includes only filled invite emails', () => {
    expect(
      buildCreateCampaignInput({
        name: 'The Sunless Citadel',
        inviteEmails: [{ email: ' player@example.com ' }, { email: '' }],
      } as never),
    ).toMatchObject({
      inviteEmails: [{ email: 'player@example.com' }],
    })
  })
})
