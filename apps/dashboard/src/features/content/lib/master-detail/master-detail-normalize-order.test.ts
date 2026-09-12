import { describe, expect, it, vi } from 'vitest'

import {
  applyFieldIndexPermutation,
  computeNormalizedFieldOrder,
} from './master-detail-normalize-order'

describe('computeNormalizedFieldOrder', () => {
  const levels = [1, 3, 1, 1]
  const fieldIds = ['a', 'b', 'c', 'd']

  it('sorts by compare key while preserving equal-key stability', () => {
    const order = computeNormalizedFieldOrder(
      levels.length,
      (left, right) => levels[left]! - levels[right]!,
      (index) => fieldIds[index]!,
    )

    expect(order.map((index) => fieldIds[index])).toEqual(['a', 'c', 'd', 'b'])
  })

  it('places appendFieldId after peers at the same compare key', () => {
    const order = computeNormalizedFieldOrder(
      levels.length,
      (left, right) => levels[left]! - levels[right]!,
      (index) => fieldIds[index]!,
      { appendFieldId: 'd' },
    )

    expect(order.map((index) => fieldIds[index])).toEqual(['a', 'c', 'd', 'b'])
  })

  it('moves a re-leveled item after existing peers at the target key', () => {
    const reorderedLevels = [1, 1, 1, 3]
    const reorderedIds = ['a', 'b', 'c', 'd']

    const order = computeNormalizedFieldOrder(
      reorderedLevels.length,
      (left, right) => reorderedLevels[left]! - reorderedLevels[right]!,
      (index) => reorderedIds[index]!,
      { appendFieldId: 'b' },
    )

    expect(order.map((index) => reorderedIds[index])).toEqual(['a', 'c', 'b', 'd'])
  })
})

describe('applyFieldIndexPermutation', () => {
  it('reorders via move(from, to) without losing ids', () => {
    const move = vi.fn()
    applyFieldIndexPermutation(move, 4, [0, 2, 1, 3])

    expect(move.mock.calls).toEqual([[2, 1]])
  })
})
