import { describe, expect, it } from 'vitest'

import type { Ticket } from '@rpg/contracts/dev-bench'

import { findDuplicateCandidates } from './duplicate-candidates'

function ticket(overrides: Partial<Ticket> & Pick<Ticket, 'status' | 'title'>): Ticket {
  return {
    id: '507f1f77bcf86cd799439011',
    key: 'BENCH-001',
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

describe('findDuplicateCandidates', () => {
  it('excludes done and wont_do tickets', () => {
    const existing = [
      ticket({ title: 'Patch write support', status: 'done' }),
      ticket({ id: '2', key: 'BENCH-002', title: 'Patch write support', status: 'wont_do' }),
    ]

    expect(
      findDuplicateCandidates({ title: 'Patch write support', codeRefs: [] }, existing),
    ).toEqual([])
  })

  it('matches exact titles with high confidence', () => {
    const existing = [
      ticket({
        title: 'Patch write support',
        status: 'backlog',
        updatedAt: '2026-06-01T12:00:00.000Z',
      }),
    ]

    const matches = findDuplicateCandidates(
      { title: 'Patch write support', codeRefs: [] },
      existing,
    )

    expect(matches).toHaveLength(1)
    expect(matches[0]?.title).toBe('Patch write support')
  })

  it('matches shared title tokens and code ref paths', () => {
    const existing = [
      ticket({
        id: '1',
        key: 'BENCH-001',
        title: 'Campaign rules patch write path',
        status: 'backlog',
        codeRefs: [{ path: 'apps/api/src/features/dev-bench/bench.service.ts' }],
        updatedAt: '2026-06-02T12:00:00.000Z',
      }),
      ticket({
        id: '2',
        key: 'BENCH-002',
        title: 'Unrelated ticket',
        status: 'backlog',
        updatedAt: '2026-06-03T12:00:00.000Z',
      }),
    ]

    const matches = findDuplicateCandidates(
      {
        title: 'Rules patch write support',
        codeRefs: [{ path: 'apps/api/src/features/dev-bench/other.ts' }],
      },
      existing,
    )

    expect(matches.map((match) => match.id)).toEqual(['1'])
  })

  it('sorts by score then updatedAt then key', () => {
    const existing = [
      ticket({
        id: '1',
        key: 'BENCH-002',
        title: 'Shared token overlap here',
        status: 'backlog',
        updatedAt: '2026-06-01T12:00:00.000Z',
      }),
      ticket({
        id: '2',
        key: 'BENCH-001',
        title: 'Shared token overlap here',
        status: 'backlog',
        updatedAt: '2026-06-03T12:00:00.000Z',
      }),
    ]

    const matches = findDuplicateCandidates(
      { title: 'Shared token overlap candidate', codeRefs: [] },
      existing,
    )

    expect(matches.map((match) => match.key)).toEqual(['BENCH-001', 'BENCH-002'])
  })
})
