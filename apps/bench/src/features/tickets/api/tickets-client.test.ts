import { describe, expect, it, vi, beforeEach } from 'vitest'

import { createTicketInputSchema } from '@rpg/contracts/dev-bench'

import { createTicket, fetchTickets } from './tickets-client'

describe('tickets-client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('parses list response with ticket schema', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          tickets: [
            {
              id: '507f1f77bcf86cd799439011',
              key: 'BENCH-001',
              title: 'Test',
              type: 'feature',
              status: 'backlog',
              priority: 'medium',
              size: 'm',
              blockedByTicketIds: [],
              relatedTicketIds: [],
              acceptanceCriteria: [],
              codeRefs: [],
              createdBy: 'user',
              createdAt: '2026-06-01T12:00:00.000Z',
              updatedAt: '2026-06-01T12:00:00.000Z',
            },
          ],
        }),
        { status: 200 },
      ),
    )

    const tickets = await fetchTickets({ status: 'backlog' })
    expect(tickets).toHaveLength(1)
    expect(tickets[0]?.key).toBe('BENCH-001')
    expect(fetch).toHaveBeenCalledWith('/api/bench/tickets?status=backlog', {
      credentials: 'include',
    })
  })

  it('creates tickets via CSRF-free POST', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ticket: {
            id: '507f1f77bcf86cd799439011',
            key: 'BENCH-001',
            title: 'New ticket',
            type: 'feature',
            status: 'backlog',
            priority: 'medium',
            size: 'm',
            blockedByTicketIds: [],
            relatedTicketIds: [],
            acceptanceCriteria: [],
            codeRefs: [],
            createdBy: 'user',
            createdAt: '2026-06-01T12:00:00.000Z',
            updatedAt: '2026-06-01T12:00:00.000Z',
          },
        }),
        { status: 201 },
      ),
    )

    const ticket = await createTicket(
      createTicketInputSchema.parse({
        title: 'New ticket',
        type: 'feature',
        priority: 'medium',
        size: 'm',
        createdBy: 'user',
      }),
    )

    expect(ticket.title).toBe('New ticket')
    expect(fetch).toHaveBeenCalledWith(
      '/api/bench/tickets',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
      }),
    )
  })
})
