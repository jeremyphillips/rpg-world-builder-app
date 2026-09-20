import { describe, expect, it } from 'vitest'

import { formatClassCantripProgressionMetadata } from './class-cantrip-progression-field.lib'

describe('formatClassCantripProgressionMetadata', () => {
  it('reports breakpoint count and level summary', () => {
    expect(
      formatClassCantripProgressionMetadata({
        curve: {
          rows: [
            { level: 1, count: 2 },
            { level: 4, count: 3 },
            { level: 10, count: 4 },
          ],
        },
        extension: 'carryForward',
      }),
    ).toBe('3 breakpoints · L1: 2 · L4: 3 · L10: 4')
  })

  it('sorts rows by level for the summary', () => {
    expect(
      formatClassCantripProgressionMetadata({
        curve: {
          rows: [
            { level: 10, count: 4 },
            { level: 1, count: 2 },
            { level: 4, count: 3 },
          ],
        },
        extension: 'carryForward',
      }),
    ).toBe('3 breakpoints · L1: 2 · L4: 3 · L10: 4')
  })

  it('singularizes a single breakpoint', () => {
    expect(
      formatClassCantripProgressionMetadata({
        curve: { rows: [{ level: 1, count: 3 }] },
        extension: 'carryForward',
      }),
    ).toBe('1 breakpoint · L1: 3')
  })

  it('returns zero breakpoints when absent or empty', () => {
    expect(formatClassCantripProgressionMetadata(undefined)).toBe('0 breakpoints')
    expect(
      formatClassCantripProgressionMetadata({
        curve: { rows: [] },
        extension: 'carryForward',
      }),
    ).toBe('0 breakpoints')
  })
})
