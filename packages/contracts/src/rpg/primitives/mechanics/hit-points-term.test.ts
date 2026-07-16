import { describe, expect, it } from 'vitest'

import { HIT_POINTS_TERM } from './hit-points-term'

describe('HIT_POINTS_TERM', () => {
  it('uses title-case Hit Points in generated prose', () => {
    expect(HIT_POINTS_TERM.plural).toBe('Hit Points')
  })
})
