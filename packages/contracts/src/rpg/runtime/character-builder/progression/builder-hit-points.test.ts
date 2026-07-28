import { describe, expect, it } from 'vitest'

import { storedFighter } from '../test-fixtures'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import { DEFAULT_BUILDER_HIT_POINT_SOURCE, resolveBuilderMaxHitPoints } from './builder-hit-points'
import { resolveMaxHpAtLevel } from '../../character/derive/hit-points-at-level'

describe('resolveMaxHpAtLevel', () => {
  it('uses max die at level 1 with a minimum of 1', () => {
    expect(
      resolveMaxHpAtLevel({
        hitDie: 8,
        constitutionModifier: -2,
        level: 1,
        method: 'average',
      }),
    ).toBe(6)
  })

  it('accumulates average gains for higher levels', () => {
    expect(
      resolveMaxHpAtLevel({
        hitDie: 10,
        constitutionModifier: 1,
        level: 5,
        method: 'average',
      }),
    ).toBe(39)
  })
})

describe('resolveBuilderMaxHitPoints', () => {
  it('matches finalize preview HP for a level 1 fighter', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: storedFighter.id, level: 1 },
      abilities: {
        method: 'standard-array' as const,
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
    }

    expect(
      resolveBuilderMaxHitPoints(draft, storedFighter, {
        source: DEFAULT_BUILDER_HIT_POINT_SOURCE,
      }),
    ).toBe(11)
  })
})
