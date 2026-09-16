import { describe, expect, it } from 'vitest'

import {
  FIELD_ROW_GAP_PX,
  FIELD_ROW_MIN_AUTO_TRACK_PX,
  FIELD_ROW_MIN_FLEX_TRACK_PX,
  resolveFieldRowCollapseMinWidth,
} from './field-row-collapse.lib'

describe('resolveFieldRowCollapseMinWidth', () => {
  it('returns 0 for a single field', () => {
    expect(resolveFieldRowCollapseMinWidth(['full'])).toBe(0)
  })

  it('sums fixed tracks, gaps, and flexible minima for weapon-style 1/2 + 1/2 rows', () => {
    const width = resolveFieldRowCollapseMinWidth(['1/2', '1/2'], 'form')
    expect(width).toBe(FIELD_ROW_MIN_FLEX_TRACK_PX * 2 + FIELD_ROW_GAP_PX.form)
  })

  it('counts each auto track at the conservative intrinsic minimum', () => {
    const width = resolveFieldRowCollapseMinWidth(['auto', 'auto', 'auto', 'auto'], 'compact')
    expect(width).toBe(FIELD_ROW_MIN_AUTO_TRACK_PX * 4 + FIELD_ROW_GAP_PX.compact * 3)
  })

  it('includes rem fixed widths for md + fraction mixes', () => {
    const width = resolveFieldRowCollapseMinWidth(['md', '1/2'], 'form')
    expect(width).toBe(9 * 16 + FIELD_ROW_GAP_PX.form + FIELD_ROW_MIN_FLEX_TRACK_PX)
  })
})
