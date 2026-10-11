import { describe, expect, it } from 'vitest'

import { averageStatBlockHitPoints } from './stat-block-average'

describe('averageStatBlockHitPoints', () => {
  it('clamps negative, zero, and boundary averages to at least 1', () => {
    expect(averageStatBlockHitPoints({ hitDieFaces: 4, hitDiceCount: 1, conModifier: -3 })).toBe(1)
    expect(averageStatBlockHitPoints({ hitDieFaces: 6, hitDiceCount: 1, conModifier: -3 })).toBe(1)
    expect(averageStatBlockHitPoints({ hitDieFaces: 4, hitDiceCount: 1, conModifier: -1 })).toBe(1)
    expect(averageStatBlockHitPoints({ hitDieFaces: 6, hitDiceCount: 3, conModifier: -1 })).toBe(7)
  })
})
