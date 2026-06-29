import { describe, expect, it } from 'vitest'

import type { Epic, Ticket } from '@rpg/contracts/dev-bench'

import {
  isTicketEligibleForRecommendation,
  scoreTicketForRecommendation,
  suggestNextTicket,
} from './recommendation'

function ticket(overrides: Partial<Ticket> & Pick<Ticket, 'status'>): Ticket {
  return {
    id: '507f1f77bcf86cd799439011',
    key: 'BENCH-001',
    title: 'Test ticket',
    type: 'feature',
    priority: 'medium',
    size: 'm',
    blockedByTicketIds: [],
    relatedTicketIds: [],
    acceptanceCriteria: [],
    codeRefs: [],
    createdBy: 'user',
    createdAt: '2026-06-01T12:00:00.000Z',
    updatedAt: '2026-06-01T12:00:00.000Z',
    ...overrides,
  }
}

function epic(overrides: Partial<Epic> & Pick<Epic, 'id' | 'title'>): Epic {
  return {
    status: 'active',
    createdAt: '2026-06-01T12:00:00.000Z',
    updatedAt: '2026-06-01T12:00:00.000Z',
    ...overrides,
  }
}

describe('isTicketEligibleForRecommendation', () => {
  it('allows backlog and up_next without blockers', () => {
    expect(isTicketEligibleForRecommendation(ticket({ status: 'backlog' }))).toBe(true)
    expect(isTicketEligibleForRecommendation(ticket({ status: 'up_next' }))).toBe(true)
  })

  it('rejects in_progress, blocked, done, and wont_do', () => {
    expect(isTicketEligibleForRecommendation(ticket({ status: 'in_progress' }))).toBe(false)
    expect(isTicketEligibleForRecommendation(ticket({ status: 'blocked' }))).toBe(false)
    expect(isTicketEligibleForRecommendation(ticket({ status: 'done' }))).toBe(false)
    expect(isTicketEligibleForRecommendation(ticket({ status: 'wont_do' }))).toBe(false)
  })

  it('rejects tickets with blockers', () => {
    expect(
      isTicketEligibleForRecommendation(
        ticket({ status: 'backlog', blockedByTicketIds: ['blocker-id'] }),
      ),
    ).toBe(false)
  })

  it('filters by epic and area context', () => {
    const scoped = ticket({
      status: 'backlog',
      epicId: 'epic-1',
      area: 'rules',
    })

    expect(isTicketEligibleForRecommendation(scoped, { epicId: 'epic-1' })).toBe(true)
    expect(isTicketEligibleForRecommendation(scoped, { epicId: 'epic-2' })).toBe(false)
    expect(isTicketEligibleForRecommendation(scoped, { area: 'rules' })).toBe(true)
    expect(isTicketEligibleForRecommendation(scoped, { area: 'api' })).toBe(false)
    expect(isTicketEligibleForRecommendation(scoped, { epicId: 'epic-1', area: 'rules' })).toBe(
      true,
    )
    expect(isTicketEligibleForRecommendation(scoped, { epicId: 'epic-1', area: 'api' })).toBe(false)
  })
})

describe('scoreTicketForRecommendation', () => {
  it('ranks higher priority and up_next above backlog', () => {
    const epics = [epic({ id: 'epic-1', title: 'Rules' })]

    const backlogHigh = ticket({
      status: 'backlog',
      priority: 'high',
      epicId: 'epic-1',
    })
    const upNextMedium = ticket({
      id: '2',
      key: 'BENCH-002',
      status: 'up_next',
      priority: 'medium',
      epicId: 'epic-1',
    })

    expect(scoreTicketForRecommendation(upNextMedium, epics)).toBeGreaterThan(
      scoreTicketForRecommendation(backlogHigh, epics),
    )
  })

  it('applies active epic bonus and size penalty', () => {
    const epics = [
      epic({ id: 'epic-active', title: 'Active', status: 'active' }),
      epic({ id: 'epic-paused', title: 'Paused', status: 'paused' }),
    ]

    const activeEpicTicket = ticket({ status: 'backlog', epicId: 'epic-active' })
    const pausedEpicTicket = ticket({ status: 'backlog', epicId: 'epic-paused' })
    const xlTicket = ticket({ status: 'backlog', size: 'xl' })

    expect(scoreTicketForRecommendation(activeEpicTicket, epics)).toBeGreaterThan(
      scoreTicketForRecommendation(pausedEpicTicket, epics),
    )
    expect(
      scoreTicketForRecommendation(ticket({ status: 'backlog', size: 'm' }), epics),
    ).toBeGreaterThan(scoreTicketForRecommendation(xlTicket, epics))
  })
})

describe('suggestNextTicket', () => {
  it('returns null when no eligible tickets', () => {
    expect(
      suggestNextTicket([ticket({ status: 'in_progress' })], [], { epicId: 'epic-1' }),
    ).toBeNull()
  })

  it('picks highest scored eligible ticket', () => {
    const epics = [epic({ id: 'epic-1', title: 'Rules' })]
    const tickets = [
      ticket({
        id: '1',
        key: 'BENCH-001',
        status: 'backlog',
        priority: 'low',
        epicId: 'epic-1',
        updatedAt: '2026-06-03T12:00:00.000Z',
      }),
      ticket({
        id: '2',
        key: 'BENCH-002',
        status: 'up_next',
        priority: 'critical',
        epicId: 'epic-1',
        updatedAt: '2026-06-01T12:00:00.000Z',
      }),
    ]

    const next = suggestNextTicket(tickets, epics, { epicId: 'epic-1' })
    expect(next?.id).toBe('2')
  })

  it('tie-breaks by priority then updatedAt then key', () => {
    const tickets = [
      ticket({
        id: '1',
        key: 'BENCH-002',
        status: 'backlog',
        priority: 'high',
        updatedAt: '2026-06-01T12:00:00.000Z',
      }),
      ticket({
        id: '2',
        key: 'BENCH-001',
        status: 'backlog',
        priority: 'high',
        updatedAt: '2026-06-02T12:00:00.000Z',
      }),
    ]

    const next = suggestNextTicket(tickets, [])
    expect(next?.key).toBe('BENCH-001')
  })
})
