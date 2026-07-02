import { describe, expect, it } from 'vitest'

import {
  applyLevelRangeMaxChange,
  applyLevelRangeMinChange,
  levelRangeRowsEqual,
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

  it('allows any level from the previous min plus one through the row max', () => {
    expect(minLevelSelectable(VALID_TABLE, 1, 2, 20)).toBe(true)
    expect(minLevelSelectable(VALID_TABLE, 1, 3, 20)).toBe(true)
    expect(minLevelSelectable(VALID_TABLE, 1, 4, 20)).toBe(true)
    expect(minLevelSelectable(VALID_TABLE, 1, 5, 20)).toBe(false)
  })
})

describe('maxLevelSelectable', () => {
  it('rejects values below the row min or above effective max', () => {
    expect(maxLevelSelectable(VALID_TABLE, 1, 1, 2, 20)).toBe(false)
    expect(maxLevelSelectable(VALID_TABLE, 1, 21, 2, 20)).toBe(false)
  })

  it('allows values up to the next row max so cascade edits can expand a tier', () => {
    expect(maxLevelSelectable(VALID_TABLE, 0, 3, 1, 20)).toBe(true)
    expect(maxLevelSelectable(VALID_TABLE, 0, 4, 1, 20)).toBe(true)
    expect(maxLevelSelectable(VALID_TABLE, 0, 5, 1, 20)).toBe(false)
  })

  it('allows the last row to reach effective max', () => {
    expect(maxLevelSelectable(VALID_TABLE, 2, 20, 5, 20)).toBe(true)
  })
})

describe('applyLevelRangeMaxChange', () => {
  it('expands the first tier and pushes the next tier min forward', () => {
    expect(applyLevelRangeMaxChange([...VALID_TABLE], 0, 3)).toEqual([
      { minLevel: 1, maxLevel: 3 },
      { minLevel: 4, maxLevel: 4 },
      { minLevel: 5, maxLevel: 10 },
    ])
  })

  it('shrinks the first tier and pulls the next tier min backward', () => {
    const expanded = applyLevelRangeMaxChange([...VALID_TABLE], 0, 3)

    expect(applyLevelRangeMaxChange(expanded, 0, 1)).toEqual([
      { minLevel: 1, maxLevel: 1 },
      { minLevel: 2, maxLevel: 4 },
      { minLevel: 5, maxLevel: 10 },
    ])
  })

  it('expands a middle tier into the next tier range', () => {
    expect(applyLevelRangeMaxChange([...VALID_TABLE], 1, 10)).toEqual([
      { minLevel: 1, maxLevel: 1 },
      { minLevel: 2, maxLevel: 10 },
      { minLevel: 11, maxLevel: 11 },
    ])
  })
})

describe('applyLevelRangeMinChange', () => {
  it('raises a tier min and shrinks the previous tier max', () => {
    expect(applyLevelRangeMinChange([...VALID_TABLE], 1, 4)).toEqual([
      { minLevel: 1, maxLevel: 3 },
      { minLevel: 4, maxLevel: 4 },
      { minLevel: 5, maxLevel: 10 },
    ])
  })

  it('lowers a tier min and expands the previous tier max', () => {
    const raised = applyLevelRangeMinChange([...VALID_TABLE], 1, 4)

    expect(applyLevelRangeMinChange(raised, 1, 2)).toEqual([
      { minLevel: 1, maxLevel: 1 },
      { minLevel: 2, maxLevel: 4 },
      { minLevel: 5, maxLevel: 10 },
    ])
  })
})

describe('levelRangeRowsEqual', () => {
  it('compares min/max pairs regardless of object identity', () => {
    expect(
      levelRangeRowsEqual(
        VALID_TABLE,
        VALID_TABLE.map((row) => ({ ...row })),
      ),
    ).toBe(true)
    expect(levelRangeRowsEqual(VALID_TABLE, [{ minLevel: 1, maxLevel: 2 }])).toBe(false)
  })
})
