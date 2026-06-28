import { describe, expect, it } from 'vitest'

import {
  BENCH_COLUMNS,
  benchColumnForStatus,
  isBenchVisibleStatus,
  statusesForBenchColumn,
} from './bench-columns'

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
