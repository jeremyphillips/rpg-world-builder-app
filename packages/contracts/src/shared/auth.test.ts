import { describe, expect, it } from 'vitest'
import { loginInputSchema, registerInputSchema } from './auth'

describe('loginInputSchema', () => {
  it('accepts valid credentials', () => {
    expect(
      loginInputSchema.safeParse({ email: 'dm@example.com', password: 'supersecret' }).success,
    ).toBe(true)
  })

  it('rejects an invalid email', () => {
    expect(loginInputSchema.safeParse({ email: 'nope', password: 'supersecret' }).success).toBe(
      false,
    )
  })

  it('rejects a too-short password', () => {
    expect(loginInputSchema.safeParse({ email: 'dm@example.com', password: 'short' }).success).toBe(
      false,
    )
  })
})

describe('registerInputSchema', () => {
  it('accepts a valid registration', () => {
    expect(
      registerInputSchema.safeParse({
        email: 'dm@example.com',
        password: 'supersecret',
        displayName: 'Dungeon Master',
      }).success,
    ).toBe(true)
  })

  it('rejects a missing displayName', () => {
    expect(
      registerInputSchema.safeParse({ email: 'dm@example.com', password: 'supersecret' }).success,
    ).toBe(false)
  })
})
