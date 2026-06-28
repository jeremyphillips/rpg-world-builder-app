import { describe, expect, it } from 'vitest'

import { formatTicketKey, parseTicketKey, ticketKeySchema } from './ticket-key'

describe('formatTicketKey', () => {
  it('pads sequences below 100', () => {
    expect(formatTicketKey(1)).toBe('BENCH-001')
    expect(formatTicketKey(42)).toBe('BENCH-042')
    expect(formatTicketKey(99)).toBe('BENCH-099')
  })

  it('preserves unpadded width for sequences >= 100', () => {
    expect(formatTicketKey(100)).toBe('BENCH-100')
    expect(formatTicketKey(1000)).toBe('BENCH-1000')
  })

  it('rejects non-positive and non-integer sequences', () => {
    expect(() => formatTicketKey(0)).toThrow(RangeError)
    expect(() => formatTicketKey(-1)).toThrow(RangeError)
    expect(() => formatTicketKey(1.5)).toThrow(RangeError)
  })
})

describe('parseTicketKey', () => {
  it('parses formatted keys', () => {
    expect(parseTicketKey('BENCH-001')).toBe(1)
    expect(parseTicketKey('BENCH-1000')).toBe(1000)
  })

  it('returns null for invalid keys', () => {
    expect(parseTicketKey('RPG-001')).toBeNull()
    expect(parseTicketKey('BENCH-')).toBeNull()
    expect(parseTicketKey('not-a-key')).toBeNull()
  })
})

describe('ticketKeySchema', () => {
  it('accepts keys with at least three digits', () => {
    expect(ticketKeySchema.safeParse('BENCH-001').success).toBe(true)
    expect(ticketKeySchema.safeParse('BENCH-1000').success).toBe(true)
  })

  it('rejects keys with fewer than three digits', () => {
    expect(ticketKeySchema.safeParse('BENCH-01').success).toBe(false)
  })
})
