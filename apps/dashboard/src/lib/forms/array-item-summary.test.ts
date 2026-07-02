import { describe, expect, it } from 'vitest'

import {
  appendGrantCountSummaryPart,
  formatCharacterLevelSummaryPart,
  formatGrantCountSummaryPart,
  joinFormArrayItemSummaryParts,
} from './array-item-summary'

describe('formatGrantCountSummaryPart', () => {
  it('returns undefined for zero grants', () => {
    expect(formatGrantCountSummaryPart(0)).toBeUndefined()
  })

  it('singularizes one grant', () => {
    expect(formatGrantCountSummaryPart(1)).toBe('1 grant')
  })

  it('pluralizes multiple grants', () => {
    expect(formatGrantCountSummaryPart(2)).toBe('2 grants')
  })
})

describe('appendGrantCountSummaryPart', () => {
  it('appends a grant segment when count is positive', () => {
    const parts = ['Levels 2–4']
    appendGrantCountSummaryPart(parts, 1)
    expect(parts).toEqual(['Levels 2–4', '1 grant'])
  })
})

describe('formatCharacterLevelSummaryPart', () => {
  it('formats a single character level', () => {
    expect(formatCharacterLevelSummaryPart(3)).toBe('Level 3')
  })

  it('returns undefined for empty level values', () => {
    expect(formatCharacterLevelSummaryPart(undefined)).toBeUndefined()
  })
})

describe('joinFormArrayItemSummaryParts', () => {
  it('joins segments with the array item separator', () => {
    expect(joinFormArrayItemSummaryParts(['Level 3', 'Rage', '2 grants'])).toBe(
      'Level 3 · Rage · 2 grants',
    )
  })
})
