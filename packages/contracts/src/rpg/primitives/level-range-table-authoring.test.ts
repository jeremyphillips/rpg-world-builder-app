import { describe, expect, it } from 'vitest'

import {
  maxLevelSelectable,
  minLevelSelectable,
  nextLevelRangeRowDefaults,
} from './level-range-table-authoring'

const VALID_TABLE = [
  { minLevel: 1, maxLevel: 1 },
  { minLevel: 2, maxLevel: 4 },
  { minLevel: 5, maxLevel: 10 },
] as const

describe('nextLevelRangeRowDefaults', () => {
  it('starts at 1 when the table is empty', () => {
    expect(nextLevelRangeRowDefaults([], 20)).toEqual({ minLevel: 1, maxLevel: 20 })
  })

  it('continues after the last row max', () => {
    expect(nextLevelRangeRowDefaults([...VALID_TABLE], 20)).toEqual({ minLevel: 11, maxLevel: 20 })
  })
})

describe('minLevelSelectable', () => {
  it('allows only level 1 for the first row', () => {
    expect(minLevelSelectable(VALID_TABLE, 0, 1, 20)).toBe(true)
    expect(minLevelSelectable(VALID_TABLE, 0, 2, 20)).toBe(false)
  })

  it('requires the previous max plus one for later rows', () => {
    expect(minLevelSelectable(VALID_TABLE, 1, 2, 20)).toBe(true)
    expect(minLevelSelectable(VALID_TABLE, 1, 3, 20)).toBe(false)
  })
})

describe('maxLevelSelectable', () => {
  it('rejects values below the row min or above effective max', () => {
    expect(maxLevelSelectable(VALID_TABLE, 1, 1, 2, 20)).toBe(false)
    expect(maxLevelSelectable(VALID_TABLE, 1, 21, 2, 20)).toBe(false)
  })

  it('rejects values that would overlap the next row', () => {
    expect(maxLevelSelectable(VALID_TABLE, 1, 4, 2, 20)).toBe(true)
    expect(maxLevelSelectable(VALID_TABLE, 1, 5, 2, 20)).toBe(false)
  })
})
