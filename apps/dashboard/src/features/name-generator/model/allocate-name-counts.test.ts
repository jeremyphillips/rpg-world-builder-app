import type { NamingRecommendation } from '@rpg/contracts/name-generator'

import { allocateNameCounts, buildWeightedRoundRobinOrder } from './allocate-name-counts'

describe('allocateNameCounts', () => {
  const matches: NamingRecommendation[] = [
    { conventionId: 'high', score: 50, reasons: [] },
    { conventionId: 'wood', score: 30, reasons: [] },
    { conventionId: 'drow', score: 20, reasons: [] },
  ]

  it('allocates proportionally with a minimum of one per convention', () => {
    expect(allocateNameCounts(matches, 10)).toEqual({
      high: 5,
      wood: 3,
      drow: 2,
    })
  })

  it('assigns one name each when total is below convention count', () => {
    expect(allocateNameCounts(matches, 2)).toEqual({
      high: 1,
      wood: 1,
    })
  })

  it('returns empty quotas for no matches', () => {
    expect(allocateNameCounts([], 10)).toEqual({})
  })
})

describe('buildWeightedRoundRobinOrder', () => {
  it('interleaves conventions instead of grouping by quota', () => {
    const order = buildWeightedRoundRobinOrder(
      [
        { conventionId: 'a', score: 5, reasons: [] },
        { conventionId: 'b', score: 3, reasons: [] },
        { conventionId: 'c', score: 2, reasons: [] },
      ],
      { a: 2, b: 1, c: 1 },
    )

    expect(order).toEqual(['a', 'b', 'c', 'a'])
  })
})
