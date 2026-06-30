import { describe, expect, it } from 'vitest'

import {
  isValidFieldArrayMove,
  resolveSelectedIndexAfterMove,
  resolveSelectedIndexAfterRemove,
} from './master-detail-reorder'

describe('resolveSelectedIndexAfterMove', () => {
  it('follows the moved row', () => {
    expect(resolveSelectedIndexAfterMove(0, 0, 2)).toBe(2)
  })

  it('shifts indices between from and to', () => {
    expect(resolveSelectedIndexAfterMove(2, 0, 2)).toBe(1)
    expect(resolveSelectedIndexAfterMove(0, 2, 0)).toBe(1)
  })

  it('leaves unrelated indices unchanged', () => {
    expect(resolveSelectedIndexAfterMove(2, 0, 1)).toBe(2)
  })
})

describe('resolveSelectedIndexAfterRemove', () => {
  it('shifts selection down when an earlier row is removed', () => {
    expect(resolveSelectedIndexAfterRemove(2, 0)).toBe(1)
  })

  it('keeps selection when a later row is removed', () => {
    expect(resolveSelectedIndexAfterRemove(1, 2)).toBe(1)
  })
})

describe('isValidFieldArrayMove', () => {
  it('rejects no-op and out-of-range moves', () => {
    expect(isValidFieldArrayMove(1, 1, 3)).toBe(false)
    expect(isValidFieldArrayMove(-1, 0, 3)).toBe(false)
    expect(isValidFieldArrayMove(0, 3, 3)).toBe(false)
  })

  it('accepts in-range moves', () => {
    expect(isValidFieldArrayMove(0, 2, 3)).toBe(true)
  })
})
