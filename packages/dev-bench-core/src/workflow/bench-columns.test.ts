import { describe, expect, it } from 'vitest'

import type { Ticket } from '@rpg/contracts/dev-bench'

import {
  BENCH_COLUMNS,
  benchColumnForStatus,
  bucketTicketsByBenchColumn,
  getMoveStatusOptions,
  isBenchVisibleStatus,
  MOVE_STATUS_OPTIONS,
  shouldConfirmStatusMove,
  sortBenchColumnTickets,
  statusesForBenchColumn,
} from './bench-columns'

function ticket(overrides: Partial<Ticket> & Pick<Ticket, 'key' | 'status'>): Ticket {
  return {
    id: `id-${overrides.key}`,
    title: overrides.title ?? overrides.key,
    description: '',
    type: 'feature',
    priority: 'medium',
    size: 'm',
    area: undefined,
    epicId: null,
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

describe('isBenchVisibleStatus', () => {
  it('returns true for bench workflow statuses', () => {
    for (const column of BENCH_COLUMNS) {
      expect(isBenchVisibleStatus(column)).toBe(true)
    }
  })

  it('returns false for backlog and wont_do', () => {
    expect(isBenchVisibleStatus('backlog')).toBe(false)
    expect(isBenchVisibleStatus('wont_do')).toBe(false)
  })
})

describe('benchColumnForStatus', () => {
  it('maps bench-visible statuses to their column', () => {
    expect(benchColumnForStatus('up_next')).toBe('up_next')
    expect(benchColumnForStatus('in_progress')).toBe('in_progress')
    expect(benchColumnForStatus('blocked')).toBe('blocked')
    expect(benchColumnForStatus('done')).toBe('done')
  })

  it('returns null for non-bench statuses', () => {
    expect(benchColumnForStatus('backlog')).toBeNull()
    expect(benchColumnForStatus('wont_do')).toBeNull()
  })
})

describe('statusesForBenchColumn', () => {
  it('round-trips with benchColumnForStatus', () => {
    for (const column of BENCH_COLUMNS) {
      const statuses = statusesForBenchColumn(column)
      expect(statuses).toEqual([column])
      expect(benchColumnForStatus(statuses[0]!)).toBe(column)
    }
  })
})

describe('getMoveStatusOptions', () => {
  it('excludes the current status', () => {
    expect(getMoveStatusOptions('up_next')).not.toContain('up_next')
    expect(getMoveStatusOptions('up_next')).toHaveLength(MOVE_STATUS_OPTIONS.length - 1)
  })

  it('includes all six move targets when current is off-bench', () => {
    expect(getMoveStatusOptions('backlog')).toEqual(
      MOVE_STATUS_OPTIONS.filter((s) => s !== 'backlog'),
    )
  })
})

describe('shouldConfirmStatusMove', () => {
  it('returns true when moving a blocked ticket to done', () => {
    expect(shouldConfirmStatusMove({ blockedByTicketIds: ['blocker-id'] }, 'done')).toBe(true)
  })

  it('returns false for done without blockers or other statuses', () => {
    expect(shouldConfirmStatusMove({ blockedByTicketIds: [] }, 'done')).toBe(false)
    expect(shouldConfirmStatusMove({ blockedByTicketIds: ['blocker-id'] }, 'blocked')).toBe(false)
  })
})

describe('sortBenchColumnTickets', () => {
  it('sorts by priority desc, then updatedAt desc, then key asc', () => {
    const sorted = sortBenchColumnTickets([
      ticket({
        key: 'BENCH-003',
        status: 'up_next',
        priority: 'low',
        updatedAt: '2026-06-03T00:00:00.000Z',
      }),
      ticket({
        key: 'BENCH-001',
        status: 'up_next',
        priority: 'critical',
        updatedAt: '2026-06-01T00:00:00.000Z',
      }),
      ticket({
        key: 'BENCH-002',
        status: 'up_next',
        priority: 'critical',
        updatedAt: '2026-06-02T00:00:00.000Z',
      }),
      ticket({
        key: 'BENCH-004',
        status: 'up_next',
        priority: 'high',
        updatedAt: '2026-06-04T00:00:00.000Z',
      }),
    ])

    expect(sorted.map((t) => t.key)).toEqual(['BENCH-002', 'BENCH-001', 'BENCH-004', 'BENCH-003'])
  })
})

describe('bucketTicketsByBenchColumn', () => {
  it('excludes backlog and wont_do and sorts each column', () => {
    const buckets = bucketTicketsByBenchColumn([
      ticket({ key: 'BENCH-010', status: 'backlog' }),
      ticket({ key: 'BENCH-011', status: 'wont_do' }),
      ticket({ key: 'BENCH-002', status: 'up_next', priority: 'low' }),
      ticket({ key: 'BENCH-001', status: 'up_next', priority: 'high' }),
      ticket({ key: 'BENCH-003', status: 'done' }),
    ])

    expect(buckets.up_next.map((t) => t.key)).toEqual(['BENCH-001', 'BENCH-002'])
    expect(buckets.in_progress).toEqual([])
    expect(buckets.blocked).toEqual([])
    expect(buckets.done.map((t) => t.key)).toEqual(['BENCH-003'])
  })
})
