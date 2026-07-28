import { describe, expect, it } from 'vitest'

import { generateInviteToken, hashInviteToken } from './campaign-invite-token'

describe('campaign invite token utilities', () => {
  it('generates a 64-character hex token', () => {
    const token = generateInviteToken()
    expect(token).toMatch(/^[0-9a-f]{64}$/)
  })

  it('hashes tokens deterministically with SHA-256', () => {
    const token = 'abc123'
    expect(hashInviteToken(token)).toBe(hashInviteToken(token))
    expect(hashInviteToken(token)).toHaveLength(64)
  })

  it('produces different hashes for different tokens', () => {
    expect(hashInviteToken('token-a')).not.toBe(hashInviteToken('token-b'))
  })
})
