import { describe, expect, it } from 'vitest'

import {
  getSpellAtomicEffectKindLabel,
  HIT_POINTS_TERM,
  SPELL_ATOMIC_EFFECT_KINDS,
} from './atomic-effect-kind'

describe('spell atomic effect kind vocabulary', () => {
  it('exposes labels for every kind', () => {
    for (const kind of SPELL_ATOMIC_EFFECT_KINDS) {
      expect(getSpellAtomicEffectKindLabel(kind).length).toBeGreaterThan(0)
    }
  })

  it('uses title-case Hit Points in generated prose', () => {
    expect(HIT_POINTS_TERM.plural).toBe('Hit Points')
  })
})
