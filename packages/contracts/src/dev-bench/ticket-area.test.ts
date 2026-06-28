import { describe, expect, it } from 'vitest'

import { TICKET_AREA_SUGGESTIONS, ticketAreaSchema } from './ticket-area'

describe('ticketAreaSchema', () => {
  it('accepts suggested areas', () => {
    for (const area of ['character_builder', 'rules', 'api'] as const) {
      expect(ticketAreaSchema.safeParse(area).success).toBe(true)
    }
  })

  it('rejects invalid slugs', () => {
    expect(ticketAreaSchema.safeParse('CharacterBuilder').success).toBe(false)
    expect(ticketAreaSchema.safeParse('1rules').success).toBe(false)
    expect(ticketAreaSchema.safeParse('').success).toBe(false)
  })
})

describe('TICKET_AREA_SUGGESTIONS', () => {
  it('contains only valid ticket areas', () => {
    for (const area of TICKET_AREA_SUGGESTIONS) {
      expect(ticketAreaSchema.safeParse(area).success).toBe(true)
    }
  })
})
