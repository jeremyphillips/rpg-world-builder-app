import { describe, expect, it } from 'vitest'
import { authMeResponseSchema, sessionUserSchema, userSchema } from './user'

const validUser = {
  id: 'u_1',
  email: 'user@example.com',
  displayName: 'Test User',
  role: 'user',
  lastSelectedCampaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('userSchema', () => {
  it('accepts a valid user', () => {
    expect(userSchema.safeParse(validUser).success).toBe(true)
  })

  it('rejects an invalid role', () => {
    expect(userSchema.safeParse({ ...validUser, role: 'wizard' }).success).toBe(false)
  })

  it('rejects a non-ISO createdAt', () => {
    expect(userSchema.safeParse({ ...validUser, createdAt: 'yesterday' }).success).toBe(false)
  })
})

describe('sessionUserSchema', () => {
  it('strips down to the session fields', () => {
    expect(sessionUserSchema.parse(validUser)).toStrictEqual({
      id: 'u_1',
      email: 'user@example.com',
      displayName: 'Test User',
      role: 'user',
      lastSelectedCampaignId: null,
    })
  })
})

describe('authMeResponseSchema', () => {
  it('accepts a session user with a resolved active campaign', () => {
    expect(
      authMeResponseSchema.safeParse({
        user: sessionUserSchema.parse(validUser),
        activeCampaign: { id: 'c_1', name: 'Sunless Citadel' },
      }).success,
    ).toBe(true)
  })

  it('accepts null when no campaign resolves', () => {
    expect(
      authMeResponseSchema.safeParse({
        user: sessionUserSchema.parse(validUser),
        activeCampaign: null,
      }).success,
    ).toBe(true)
  })
})
