import { describe, expect, it } from 'vitest'

import {
  formatResultCount,
  maxResultCountSizerLabelLength,
  resultCountSizerLabels,
} from './format-result-count.lib'

describe('formatResultCount', () => {
  it('uses the singular only for one', () => {
    expect(formatResultCount(0)).toBe('0 results')
    expect(formatResultCount(1)).toBe('1 result')
    expect(formatResultCount(4)).toBe('4 results')
  })

  it('formats thousands separators on plural counts', () => {
    expect(formatResultCount(1000)).toBe('1,000 results')
    expect(formatResultCount(10000)).toBe('10,000 results')
  })
})

describe('resultCountSizerLabels', () => {
  it('returns at most two representative labels', () => {
    expect(resultCountSizerLabels(0)).toEqual(['0 results'])
    expect(resultCountSizerLabels(1)).toEqual(['0 results', '1 result'])
    expect(resultCountSizerLabels(2)).toEqual(['1 result', '2 results'])
    expect(resultCountSizerLabels(1000)).toEqual(['1 result', '1,000 results'])
  })

  const boundaryTotals = [0, 1, 9, 10, 99, 100, 999, 1000, 12_345] as const

  it.each(boundaryTotals)(
    'reserves enough width for every visible count from 0 through %i',
    (total) => {
      const labels = resultCountSizerLabels(total)
      expect(labels.length).toBeLessThanOrEqual(2)
      const reserveWidth = maxResultCountSizerLabelLength(labels)

      for (let count = 0; count <= total; count += 1) {
        expect(formatResultCount(count).length).toBeLessThanOrEqual(reserveWidth)
      }
    },
  )

  it('includes comma grouping on the plural reserve at 1000', () => {
    expect(resultCountSizerLabels(1000)[1]).toBe('1,000 results')
  })
})
