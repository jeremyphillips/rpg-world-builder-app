import { describe, expect, it } from 'vitest'

import { transitionHitPoints } from './monster-variant-transitions'

describe('monster variant transitions', () => {
  it('switches hit point modes and restores a stashed count', () => {
    const toFixed = transitionHitPoints(
      { kind: 'hit-dice', count: 3 },
      'fixed',
      {},
      { average: 10 },
    )
    expect(toFixed.hitPoints).toEqual({ kind: 'fixed', average: 10 })
    expect(toFixed.stash.hitDice).toBe(3)

    const back = transitionHitPoints(toFixed.hitPoints, 'hit-dice', toFixed.stash)
    expect(back.hitPoints).toEqual({ kind: 'hit-dice', count: 3 })
  })
})
