import { describe, expect, it } from 'vitest'

import { formatPreviewRailOverflowList } from './preview-rail-overflow.lib'

describe('formatPreviewRailOverflowList', () => {
  it('joins short lists', () => {
    expect(formatPreviewRailOverflowList(['Acrobatics', 'Athletics'])).toBe('Acrobatics, Athletics')
  })

  it('collapses overflow with + n more', () => {
    expect(
      formatPreviewRailOverflowList(['Acrobatics', 'Athletics', 'Stealth', 'Perception']),
    ).toBe('Acrobatics, Athletics + 2 more')
  })

  it('returns empty string for no items', () => {
    expect(formatPreviewRailOverflowList([])).toBe('')
  })
})
