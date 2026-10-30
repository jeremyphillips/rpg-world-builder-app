import { describe, expect, it } from 'vitest'

import type { SpellCastingTime } from '../../vocab/spell/casting-time'
import { ACTION_ECONOMY_IDS } from '../../vocab/action-economy'
import { CASTING_TIME_UNITS } from '../../vocab/spell/casting-time'
import { isSpellCastingTimeCompatibleWithEconomy } from './casting-economy'

function castingTime(unit: SpellCastingTime['normal']['unit']): SpellCastingTime {
  return {
    normal: {
      value: 1,
      unit,
      ...(unit === 'reaction' ? { trigger: { text: 'when struck' } } : {}),
    },
    canBeCastAsRitual: false,
  }
}

const EXPECTED: Record<string, readonly string[]> = {
  action: ['action', 'minute', 'hour'],
  'bonus-action': ['bonus-action'],
  reaction: ['reaction'],
}

describe('isSpellCastingTimeCompatibleWithEconomy', () => {
  it('accepts only the invoking economy matrix', () => {
    for (const economy of ACTION_ECONOMY_IDS) {
      for (const unit of CASTING_TIME_UNITS) {
        expect(isSpellCastingTimeCompatibleWithEconomy(castingTime(unit), economy)).toBe(
          EXPECTED[economy]?.includes(unit),
        )
      }
    }
  })
})
