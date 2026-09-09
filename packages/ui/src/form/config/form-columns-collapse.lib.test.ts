import { describe, expect, it } from 'vitest'

import {
  columnsNeedBreakpointReorder,
  resolveColumnsCollapseSequence,
} from './form-columns-collapse.lib'

const columns = [{ fields: ['a', 'b', 'c'] }, { fields: ['d'] }] as const

describe('resolveColumnsCollapseSequence', () => {
  it('concatenates columns left to right by default', () => {
    expect(resolveColumnsCollapseSequence(columns)).toEqual(['a', 'b', 'c', 'd'])
    expect(resolveColumnsCollapseSequence(columns, 'columns')).toEqual(['a', 'b', 'c', 'd'])
  })

  it('zips columns for interleave, then leftover fields from the longer column', () => {
    expect(resolveColumnsCollapseSequence(columns, 'interleave')).toEqual(['a', 'd', 'b', 'c'])
  })

  it('follows an explicit tuple sequence', () => {
    expect(
      resolveColumnsCollapseSequence(columns, [
        [0, 0],
        [1, 0],
        [0, 1],
        [0, 2],
      ]),
    ).toEqual(['a', 'd', 'b', 'c'])
  })

  it('throws when a tuple is out of range', () => {
    expect(() => resolveColumnsCollapseSequence(columns, [[2, 0]])).toThrow(/out of range/)
    expect(() => resolveColumnsCollapseSequence(columns, [[0, 9]])).toThrow(/out of range/)
  })

  it('throws when tuples omit or repeat a field', () => {
    expect(() =>
      resolveColumnsCollapseSequence(columns, [
        [0, 0],
        [1, 0],
      ]),
    ).toThrow(/exactly once/)

    expect(() =>
      resolveColumnsCollapseSequence(columns, [
        [0, 0],
        [0, 0],
        [0, 1],
        [0, 2],
      ]),
    ).toThrow(/exactly once/)
  })
})

describe('columnsNeedBreakpointReorder', () => {
  it('is false for the default column-major collapse', () => {
    expect(columnsNeedBreakpointReorder(undefined)).toBe(false)
    expect(columnsNeedBreakpointReorder('columns')).toBe(false)
  })

  it('is true for interleave and explicit tuples', () => {
    expect(columnsNeedBreakpointReorder('interleave')).toBe(true)
    expect(columnsNeedBreakpointReorder([[0, 0]])).toBe(true)
  })
})
