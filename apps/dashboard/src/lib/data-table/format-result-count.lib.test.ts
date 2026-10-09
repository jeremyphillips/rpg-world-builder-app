import { describe, expect, it } from 'vitest'

import { formatResultCount, resultCountSizerLabels } from './format-result-count.lib'

describe('formatResultCount', () => {
  it('uses the singular only for one', () => {
    expect(formatResultCount(0)).toBe('0 results')
    expect(formatResultCount(1)).toBe('1 result')
    expect(formatResultCount(4)).toBe('4 results')
  })
})

describe('resultCountSizerLabels', () => {
  it('reserves every count from zero through the eligible total', () => {
    expect(resultCountSizerLabels(2)).toEqual(['0 results', '1 result', '2 results'])
  })

  it('includes both sides of a non-monotonic glyph boundary', () => {
    const labels = resultCountSizerLabels(1000)
    expect(labels).toContain('999 results')
    expect(labels).toContain('1000 results')
  })
})
