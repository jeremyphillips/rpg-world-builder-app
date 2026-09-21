import { describe, expect, it } from 'vitest'

import {
  formatSpellLevelTabsRangeHeading,
  resolveNarrowSpellLevelTabLayout,
  resolveSpellLevelTabLayout,
} from './spell-level-tabs.lib'

describe('resolveSpellLevelTabLayout', () => {
  it('returns desktop templates for common level counts', () => {
    expect(resolveSpellLevelTabLayout(3)).toEqual([{ levels: [1, 2, 3], columns: 3 }])
    expect(resolveSpellLevelTabLayout(6)).toEqual([
      { levels: [1, 2, 3], columns: 3 },
      { levels: [4, 5, 6], columns: 3 },
    ])
    expect(resolveSpellLevelTabLayout(9)).toEqual([
      { levels: [1, 2, 3, 4, 5], columns: 5 },
      { levels: [6, 7, 8, 9], columns: 4 },
    ])
  })

  it('falls back to three-up rows for narrow layout', () => {
    expect(resolveNarrowSpellLevelTabLayout(5)).toEqual([
      { levels: [1, 2, 3], columns: 3 },
      { levels: [4, 5], columns: 2 },
    ])
  })
})

describe('formatSpellLevelTabsRangeHeading', () => {
  it('uses ordinal-level spell headings without a leading Level prefix', () => {
    expect(formatSpellLevelTabsRangeHeading(1, 1)).toBe('1st-Level Spells')
    expect(formatSpellLevelTabsRangeHeading(1, 3)).toBe('1st–3rd-Level Spells')
    expect(formatSpellLevelTabsRangeHeading(1, 9)).toBe('1st–9th-Level Spells')
  })
})
