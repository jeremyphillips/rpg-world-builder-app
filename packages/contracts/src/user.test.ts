import { describe, expect, it } from 'vitest'
import { sessionUserSchema, userSchema } from './user'

const validUser = {
  id: 'u_1',
  email: 'dm@example.com',
  displayName: 'Dungeon Master',
  role: 'dm',
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
      email: 'dm@example.com',
      displayName: 'Dungeon Master',
      role: 'dm',
    })
  })
})
