import { describe, expect, it } from 'vitest'

import { isTicketKeyRef } from './ticket-ref'

describe('isTicketKeyRef', () => {
  it('detects display keys', () => {
    expect(isTicketKeyRef('BENCH-001')).toBe(true)
    expect(isTicketKeyRef('BENCH-1234')).toBe(true)
  })

  it('treats mongo ids as non-keys', () => {
    expect(isTicketKeyRef('507f1f77bcf86cd799439011')).toBe(false)
    expect(isTicketKeyRef('RPG-001')).toBe(false)
  })
})
