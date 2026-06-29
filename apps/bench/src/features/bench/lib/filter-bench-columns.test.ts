import { describe, expect, it } from 'vitest'

import type { Ticket } from '@rpg/contracts/dev-bench'

import { sampleTicket } from '@/features/tickets'

import { filterBenchColumnsBySearch } from './filter-bench-columns'

const columns = {
  up_next: [{ ...sampleTicket, id: '1', title: 'Auth bug fix' }],
  in_progress: [{ ...sampleTicket, id: '2', title: 'Bench board polish' }],
  blocked: [] as Ticket[],
  done: [] as Ticket[],
}

describe('filterBenchColumnsBySearch', () => {
  it('returns all columns when search is empty', () => {
    expect(filterBenchColumnsBySearch(columns, '')).toEqual(columns)
  })

  it('filters tickets by normalized title search', () => {
    expect(filterBenchColumnsBySearch(columns, 'auth bug')).toEqual({
      up_next: columns.up_next,
      in_progress: [],
      blocked: [],
      done: [],
    })
  })
})
