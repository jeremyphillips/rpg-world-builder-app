import { describe, expect, it } from 'vitest'

import { resolveMonsterCreateDefaultValues } from './monster-form-values'
import {
  applyHitPointsFixedToggle,
  formatMonsterHitPointsPreviewLine,
  hitPointsDiceFromFormValues,
} from './monster-hit-points-form.lib'

describe('monster hit points form', () => {
  it('derives preview from default hit dice when hitPoints is omitted from watched slice', () => {
    expect(
      formatMonsterHitPointsPreviewLine({
        size: 'medium',
        abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      } as Parameters<typeof formatMonsterHitPointsPreviewLine>[0]),
    ).toBe('HP 4 (1d8)')
  })

  it('formats derived preview as HP value then parenthesized formula', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.abilityScores.con = 8
    values.hitPoints = { kind: 'hit-dice', count: 3 }
    values.size = 'small'
    expect(formatMonsterHitPointsPreviewLine(values)).toBe('HP 7 (3d6 -3)')
  })

  it('toggles fixed mode from derived hit dice average', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.abilityScores.con = 10
    values.hitPoints = { kind: 'hit-dice', count: 2 }
    const patch = applyHitPointsFixedToggle({ ...values, hitPointsUseFixed: true }, true)
    expect(patch.hitPoints).toEqual({ kind: 'fixed', average: 9 })
  })

  it('restores hit dice count when fixed is turned off', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.hitPoints = { kind: 'hit-dice', count: 4 }
    const enabled = applyHitPointsFixedToggle({ ...values, hitPointsUseFixed: true }, true)
    const restored = applyHitPointsFixedToggle(
      {
        ...values,
        ...enabled,
        hitPointsUseFixed: false,
      } as typeof values,
      false,
    )
    expect(restored.hitPoints).toEqual({ kind: 'hit-dice', count: 4 })
  })

  it('derives dice faces from creature size', () => {
    const values = resolveMonsterCreateDefaultValues()
    values.size = 'large'
    values.hitPoints = { kind: 'hit-dice', count: 1 }
    expect(hitPointsDiceFromFormValues(values)).toEqual({ count: 1, faces: 10 })
  })
})
