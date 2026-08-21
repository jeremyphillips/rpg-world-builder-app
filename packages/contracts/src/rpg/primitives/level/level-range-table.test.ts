import { describe, expect, it } from 'vitest'

import { levelValidationMessages } from './level-messages'
import { parseWithRefine } from '../../../test/helpers/parse-with-refine'

describe('refineLevelRangeTable', () => {
  it('accepts a valid contiguous table', () => {
    const result = parseWithRefine(
      [
        { minLevel: 1, maxLevel: 1 },
        { minLevel: 2, maxLevel: 4 },
        { minLevel: 5, maxLevel: 10 },
      ],
      { requireStartAt: 1, requireEndAt: 10, maxLevel: 20 },
    )

    expect(result.success).toBe(true)
  })

  it('rejects min greater than max', () => {
    const result = parseWithRefine([{ minLevel: 5, maxLevel: 3 }])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(levelValidationMessages.invertedRange())
      expect(result.error.issues[0]?.path).toEqual([0, 'minLevel'])
    }
  })

  it('rejects overlapping ranges', () => {
    const result = parseWithRefine([
      { minLevel: 1, maxLevel: 5 },
      { minLevel: 5, maxLevel: 10 },
    ])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        levelValidationMessages.rangeOverlap({ otherLabel: 'Levels 1–5' }),
      )
      expect(result.error.issues[0]?.path).toEqual([1, 'minLevel'])
    }
  })

  it('rejects gapped ranges', () => {
    const result = parseWithRefine([
      { minLevel: 1, maxLevel: 1 },
      { minLevel: 2, maxLevel: 4 },
      { minLevel: 6, maxLevel: 9 },
    ])

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(levelValidationMessages.rangeGap({ level: 5 }))
      expect(result.error.issues[0]?.path).toEqual([2, 'minLevel'])
    }
  })

  it('rejects when first row does not start at required level', () => {
    const result = parseWithRefine([{ minLevel: 2, maxLevel: 4 }], { requireStartAt: 1 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        levelValidationMessages.rangeStartAt({ expected: 1 }),
      )
      expect(result.error.issues[0]?.path).toEqual([0, 'minLevel'])
    }
  })

  it('rejects when last row does not end at required level', () => {
    const result = parseWithRefine(
      [
        { minLevel: 1, maxLevel: 1 },
        { minLevel: 2, maxLevel: 4 },
      ],
      { requireEndAt: 10 },
    )

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        levelValidationMessages.rangeEndAt({ expected: 10 }),
      )
      expect(result.error.issues[0]?.path).toEqual([1, 'maxLevel'])
    }
  })

  it('rejects levels outside campaign bounds', () => {
    const result = parseWithRefine([{ minLevel: 1, maxLevel: 25 }], { maxLevel: 20 })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        levelValidationMessages.outOfBounds({ maxLevel: 20 }),
      )
      expect(result.error.issues[0]?.path).toEqual([0, 'maxLevel'])
    }
  })
})
