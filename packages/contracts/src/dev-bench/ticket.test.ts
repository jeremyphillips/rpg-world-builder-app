import { describe, expect, it } from 'vitest'

import {
  getTicketPriorityLabel,
  getTicketStatusLabel,
  getTicketTypeLabel,
  ticketSchema,
  ticketStatusSchema,
  ticketTypeSchema,
} from './ticket'

const validTicket = {
  id: 'ticket_1',
  key: 'BENCH-001',
  title: 'Add patch write support',
  description: 'Cursor identified a missing path.',
  type: 'feature',
  status: 'backlog',
  priority: 'high',
  size: 'm',
  area: 'rules',
  epicId: null,
  blockedByTicketIds: [],
  relatedTicketIds: [],
  acceptanceCriteria: ['Patch write path exists'],
  codeRefs: [{ path: 'packages/contracts/src/platform' }],
  createdBy: 'user',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as const

describe('ticket enums', () => {
  it('accepts valid type and status values', () => {
    expect(ticketTypeSchema.safeParse('feature').success).toBe(true)
    expect(ticketStatusSchema.safeParse('up_next').success).toBe(true)
  })

  it('rejects invalid enum values', () => {
    expect(ticketTypeSchema.safeParse('story').success).toBe(false)
    expect(ticketStatusSchema.safeParse('todo').success).toBe(false)
  })
})

describe('ticketSchema', () => {
  it('accepts a valid ticket', () => {
    expect(ticketSchema.safeParse(validTicket).success).toBe(true)
  })

  it('rejects invalid key format', () => {
    expect(ticketSchema.safeParse({ ...validTicket, key: 'RPG-001' }).success).toBe(false)
  })
})

describe('label helpers', () => {
  it('returns labels for known values', () => {
    expect(getTicketTypeLabel('bug')).toBe('Bug')
    expect(getTicketStatusLabel('in_progress')).toBe('In Progress')
    expect(getTicketPriorityLabel('critical')).toBe('Critical')
  })

  it('falls back to the raw value for unknown ids', () => {
    expect(getTicketTypeLabel('custom')).toBe('custom')
  })
})
