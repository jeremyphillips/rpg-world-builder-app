import { describe, expect, it } from 'vitest'

import {
  levelRangeArrayPattern,
  resolveLevelRangeErrorFocusTarget,
} from './level-range-array-pattern'

describe('levelRangeArrayPattern', () => {
  it('maps overlap issues to minLevel', () => {
    const target = resolveLevelRangeErrorFocusTarget({
      issue: {
        path: 'startingWealth.tiers.1.minLevel',
        message: 'Tier level ranges must not overlap',
        severity: 'crossRow',
        relativePath: 'minLevel',
      },
      itemIndex: 1,
      levelKeys: { min: 'minLevel', max: 'maxLevel' },
    })

    expect(target).toBe('minLevel')
  })

  it('maps end-at messages to maxLevel', () => {
    const target = resolveLevelRangeErrorFocusTarget({
      issue: {
        path: 'startingWealth.tiers.3.maxLevel',
        message: 'Tier level ranges must cover levels 1–20',
        severity: 'crossRow',
        relativePath: 'maxLevel',
      },
      itemIndex: 3,
      levelKeys: { min: 'minLevel', max: 'maxLevel' },
    })

    expect(target).toBe('maxLevel')
  })

  it('exposes getErrorFocusTarget on the shared pattern config', () => {
    const pattern = levelRangeArrayPattern()
    expect(pattern.kind).toBe('levelRange')
    expect(pattern.getErrorFocusTarget).toBe(resolveLevelRangeErrorFocusTarget)
  })
})
