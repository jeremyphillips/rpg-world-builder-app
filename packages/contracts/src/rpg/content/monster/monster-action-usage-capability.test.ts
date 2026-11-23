import { describe, expect, it } from 'vitest'

import { MONSTER_ACTION_KINDS } from '../../vocab/monster-action-kind'
import { monsterActionUsageCapability } from './monster-action-authoring'

describe('monsterActionUsageCapability', () => {
  it('gives every natural weapon and authored attack the same optional recharge', () => {
    const recharge = { presentation: 'optional', kinds: ['recharge'] }
    expect(monsterActionUsageCapability({ kind: 'natural-weapon', preset: 'bite' })).toEqual(
      recharge,
    )
    expect(monsterActionUsageCapability({ kind: 'natural-weapon', preset: 'gore' })).toEqual(
      recharge,
    )
    expect(monsterActionUsageCapability({ kind: 'natural-weapon' })).toEqual(recharge)
    expect(monsterActionUsageCapability({ kind: 'attack' })).toEqual(recharge)
  })

  it('includes a recharge editor for breath weapon and omits constrict, weapons, and multiattack', () => {
    expect(monsterActionUsageCapability({ kind: 'save', preset: 'breath-weapon' })).toEqual({
      presentation: 'included',
      kinds: ['recharge'],
    })
    expect(monsterActionUsageCapability({ kind: 'save', preset: 'constrict' })).toEqual({
      presentation: 'none',
      kinds: [],
    })
    expect(monsterActionUsageCapability({ kind: 'weapon' })).toEqual({
      presentation: 'none',
      kinds: [],
    })
    expect(monsterActionUsageCapability({ kind: 'multiattack', preset: 'multiattack' })).toEqual({
      presentation: 'none',
      kinds: [],
    })
  })

  it('maps every known monster action kind through the registry (save uses preset overrides)', () => {
    for (const kind of MONSTER_ACTION_KINDS) {
      if (kind === 'save') continue
      expect(() => monsterActionUsageCapability({ kind })).not.toThrow()
    }
  })

  it('keeps full limits optional for other saves, specials, and spells', () => {
    const full = { presentation: 'optional', kinds: ['recharge', 'uses'] }
    expect(monsterActionUsageCapability({ kind: 'save' })).toEqual(full)
    expect(monsterActionUsageCapability({ kind: 'save', preset: 'other' })).toEqual(full)
    expect(monsterActionUsageCapability({ kind: 'special' })).toEqual(full)
    expect(monsterActionUsageCapability({ kind: 'spell' })).toEqual(full)
    expect(monsterActionUsageCapability({ kind: 'leap' })).toEqual(full)
    expect(monsterActionUsageCapability({ kind: 'teleport' })).toEqual(full)
    expect(monsterActionUsageCapability({ kind: 'take-actions' })).toEqual(full)
  })
})
