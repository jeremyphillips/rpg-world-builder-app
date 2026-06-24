import { describe, expect, it } from 'vitest'

import { formatGroupedNumber, parseGroupedNumber } from './number-format'

describe('formatGroupedNumber', () => {
  it('formats values at or above 1,000 with grouping', () => {
    expect(formatGroupedNumber(3000)).toBe('3,000')
    expect(formatGroupedNumber(1000)).toBe('1,000')
    expect(formatGroupedNumber(12_345)).toBe('12,345')
  })

  it('leaves values below 1,000 ungrouped', () => {
    expect(formatGroupedNumber(999)).toBe('999')
    expect(formatGroupedNumber(0)).toBe('0')
    expect(formatGroupedNumber(5)).toBe('5')
  })

  it('preserves decimal portions', () => {
    expect(formatGroupedNumber(1500.5)).toBe('1,500.5')
    expect(formatGroupedNumber(999.5)).toBe('999.5')
  })
})

describe('parseGroupedNumber', () => {
  it('parses grouped and plain numeric strings', () => {
    expect(parseGroupedNumber('3,000')).toBe(3000)
    expect(parseGroupedNumber('3000')).toBe(3000)
    expect(parseGroupedNumber('999')).toBe(999)
  })

  it('handles partial delete round-trips', () => {
    expect(parseGroupedNumber('3,00')).toBe(300)
  })

  it('returns undefined for empty or invalid input', () => {
    expect(parseGroupedNumber('')).toBeUndefined()
    expect(parseGroupedNumber('   ')).toBeUndefined()
    expect(parseGroupedNumber('abc')).toBeUndefined()
  })
})
