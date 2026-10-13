import { describe, expect, it } from 'vitest'

import { transitionArmorClass, transitionHitPoints } from './monster-variant-transitions'

describe('monster variant transitions', () => {
  it('follows the armor class transition table without editing equipment', () => {
    const toNatural = transitionArmorClass({ kind: 'unarmored' }, 'natural', {}, 12)
    expect(toNatural.armorClass).toEqual({ kind: 'natural', bonus: 1 })

    const toFixed = transitionArmorClass(toNatural.armorClass, 'fixed', toNatural.stash, 14)
    expect(toFixed.armorClass).toEqual({ kind: 'fixed', value: 14 })
    expect(toFixed.stash.natural).toBe(1)

    const back = transitionArmorClass(toFixed.armorClass, 'natural', toFixed.stash, 14)
    expect(back.armorClass).toEqual({ kind: 'natural', bonus: 1 })
    expect(back.stash.fixed).toBe(14)

    const restored = transitionArmorClass({ kind: 'natural', bonus: 2 }, 'fixed', { fixed: 17 }, 14)
    expect(restored.armorClass).toEqual({ kind: 'fixed', value: 17 })

    const emptyFixed = transitionArmorClass({ kind: 'equipment' }, 'fixed', {}, undefined)
    expect(emptyFixed.armorClass).toEqual({ kind: 'fixed' })
  })

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
