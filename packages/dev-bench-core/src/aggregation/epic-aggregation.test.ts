import { describe, expect, it } from 'vitest'

import type { Epic, Ticket } from '@rpg/contracts/dev-bench'

import {
  countEpicTicketsByBucket,
  deriveRelatedCodeAreas,
  epicTicketBucket,
  getRecentlyActiveTickets,
  groupEpicTicketsByBucket,
  normalizeEpicTitle,
  sortEpicsForDisplay,
} from './epic-aggregation'

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

describe('epicTicketBucket', () => {
  it('maps open statuses', () => {
    expect(epicTicketBucket('backlog')).toBe('open')
    expect(epicTicketBucket('up_next')).toBe('open')
    expect(epicTicketBucket('in_progress')).toBe('open')
  })

  it('maps blocked and done', () => {
    expect(epicTicketBucket('blocked')).toBe('blocked')
    expect(epicTicketBucket('done')).toBe('done')
  })

  it('excludes wont_do', () => {
    expect(epicTicketBucket('wont_do')).toBeNull()
  })
})

describe('countEpicTicketsByBucket', () => {
  it('counts buckets and excludes wont_do', () => {
    const counts = countEpicTicketsByBucket([
      ticket({ status: 'backlog' }),
      ticket({ id: '2', status: 'in_progress' }),
      ticket({ id: '3', status: 'blocked' }),
      ticket({ id: '4', status: 'done' }),
      ticket({ id: '5', status: 'wont_do' }),
    ])

    expect(counts).toEqual({ open: 2, blocked: 1, done: 1 })
  })
})

describe('groupEpicTicketsByBucket', () => {
  it('groups and sorts by updatedAt desc', () => {
    const groups = groupEpicTicketsByBucket([
      ticket({ id: '1', status: 'backlog', updatedAt: '2026-06-01T10:00:00.000Z' }),
      ticket({ id: '2', status: 'in_progress', updatedAt: '2026-06-03T10:00:00.000Z' }),
      ticket({ id: '3', status: 'wont_do' }),
    ])

    expect(groups.open.map((t) => t.id)).toEqual(['2', '1'])
    expect(groups.blocked).toHaveLength(0)
  })
})

describe('deriveRelatedCodeAreas', () => {
  it('prefers packageName and caps at limit', () => {
    const areas = deriveRelatedCodeAreas(
      [
        ticket({
          status: 'backlog',
          codeRefs: [
            { packageName: '@rpg/contracts', path: 'packages/contracts/src/index.ts' },
            { path: 'apps/bench/src/main.tsx' },
          ],
        }),
        ticket({
          id: '2',
          status: 'done',
          codeRefs: [{ path: 'packages/dev-bench-core/src/index.ts' }],
        }),
      ],
      2,
    )

    expect(areas).toEqual(['@rpg/contracts', 'apps/bench'])
  })

  it('excludes wont_do tickets', () => {
    const areas = deriveRelatedCodeAreas([
      ticket({ status: 'wont_do', codeRefs: [{ path: 'apps/bench/src/main.tsx' }] }),
    ])

    expect(areas).toEqual([])
  })
})

describe('sortEpicsForDisplay', () => {
  it('sorts by status, priority, then updatedAt', () => {
    const sorted = sortEpicsForDisplay([
      epic({
        id: '1',
        title: 'Done low',
        status: 'done',
        priority: 'low',
        updatedAt: '2026-06-05T00:00:00.000Z',
      }),
      epic({
        id: '2',
        title: 'Active medium',
        status: 'active',
        priority: 'medium',
        updatedAt: '2026-06-01T00:00:00.000Z',
      }),
      epic({
        id: '3',
        title: 'Active critical',
        status: 'active',
        priority: 'critical',
        updatedAt: '2026-06-01T00:00:00.000Z',
      }),
      epic({
        id: '4',
        title: 'Paused',
        status: 'paused',
        updatedAt: '2026-06-06T00:00:00.000Z',
      }),
    ])

    expect(sorted.map((e) => e.id)).toEqual(['3', '2', '4', '1'])
  })
})

describe('normalizeEpicTitle', () => {
  it('trims and lowercases', () => {
    expect(normalizeEpicTitle('  Character Builder  ')).toBe('character builder')
  })
})

describe('getRecentlyActiveTickets', () => {
  it('excludes wont_do and respects limit', () => {
    const recent = getRecentlyActiveTickets(
      [
        ticket({ id: '1', status: 'backlog', updatedAt: '2026-06-01T10:00:00.000Z' }),
        ticket({ id: '2', status: 'done', updatedAt: '2026-06-03T10:00:00.000Z' }),
        ticket({ id: '3', status: 'wont_do', updatedAt: '2026-06-04T10:00:00.000Z' }),
        ticket({ id: '4', status: 'blocked', updatedAt: '2026-06-02T10:00:00.000Z' }),
      ],
      2,
    )

    expect(recent.map((t) => t.id)).toEqual(['2', '4'])
  })
})
