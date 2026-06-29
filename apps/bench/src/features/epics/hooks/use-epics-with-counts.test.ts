import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

import { countEpicTicketsByBucket } from '@rpg/dev-bench-core'

import { sampleEpic, sampleEpicTickets } from '../test-fixtures'
import { useEpicsWithCounts } from './use-epics-with-counts'

vi.mock('./use-epics-list', () => ({
  useEpicsList: () => ({ data: [sampleEpic], isPending: false, isError: false, refetch: vi.fn() }),
}))

vi.mock('@/features/tickets', () => ({
  useAllTickets: () => ({
    data: sampleEpicTickets,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

describe('useEpicsWithCounts', () => {
  it('counts blocked and done tickets across all statuses', () => {
    const { result } = renderHook(() => useEpicsWithCounts({}))

    expect(result.current.epicsWithCounts).toHaveLength(1)
    expect(result.current.epicsWithCounts[0]?.counts).toEqual(
      countEpicTicketsByBucket(sampleEpicTickets),
    )
    expect(result.current.epicsWithCounts[0]?.counts.blocked).toBeGreaterThan(0)
  })
})
