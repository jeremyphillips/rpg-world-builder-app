import { describe, expect, it } from 'vitest'

import {
  deriveEffectsModelingStatus,
  formatAtomicEffectSummary,
  formatAtomicEffectSummaries,
  formatDamageValue,
  spellAtomicEffectSchema,
} from './effects'

describe('spellAtomicEffectSchema', () => {
  it('accepts representative effect kinds', () => {
    expect(
      spellAtomicEffectSchema.parse({
        id: 'fx-1',
        kind: 'damage',
        roll: { dice: { count: 1, faces: 10 } },
        damageType: 'fire',
      }),
    ).toMatchObject({ kind: 'damage' })

    expect(
      spellAtomicEffectSchema.parse({
        id: 'fx-2',
        kind: 'healing',
        roll: { dice: { count: 2, faces: 8 } },
      }),
    ).toMatchObject({ kind: 'healing' })

    expect(
      spellAtomicEffectSchema.parse({
        id: 'fx-3',
        kind: 'temporary-hit-points',
        roll: { dice: { count: 2, faces: 4 }, flat: 4 },
      }),
    ).toMatchObject({ kind: 'temporary-hit-points' })

    expect(
      spellAtomicEffectSchema.parse({
        id: 'fx-4',
        kind: 'projectile-count',
        count: 3,
        label: 'darts',
      }),
    ).toMatchObject({ count: 3, label: 'darts' })
  })
})

describe('formatAtomicEffectSummary', () => {
  it('formats single-effect summaries', () => {
    expect(
      formatAtomicEffectSummary({
        id: 'fx-1',
        kind: 'damage',
        roll: { dice: { count: 1, faces: 10 } },
        damageType: 'fire',
      }),
    ).toBe('1d10 Fire damage')

    expect(
      formatAtomicEffectSummary({
        id: 'fx-2',
        kind: 'healing',
        roll: { dice: { count: 2, faces: 8 } },
      }),
    ).toBe('2d8 healing')

    expect(
      formatAtomicEffectSummary({
        id: 'fx-3',
        kind: 'temporary-hit-points',
        roll: { dice: { count: 2, faces: 4 }, flat: 4 },
      }),
    ).toBe('2d4+4 temporary Hit Points')
  })

  it('does not imply projectile-to-damage relationships', () => {
    const summaries = formatAtomicEffectSummaries([
      {
        id: 'fx-count',
        kind: 'projectile-count',
        count: 3,
        label: 'darts',
      },
      {
        id: 'fx-damage',
        kind: 'damage',
        roll: { dice: { count: 1, faces: 4 }, flat: 1 },
        damageType: 'force',
      },
    ])

    expect(summaries).toEqual(['3 darts', '1d4+1 Force damage'])
    expect(summaries.join(' ')).not.toContain('per dart')
  })
})

describe('formatDamageValue', () => {
  it('formats typed damage rolls', () => {
    expect(formatDamageValue({ dice: { count: 8, faces: 6 } }, 'fire')).toBe('8d6 Fire damage')
  })
})

describe('deriveEffectsModelingStatus', () => {
  it('derives coarse status from effects presence', () => {
    expect(deriveEffectsModelingStatus({ effects: undefined })).toBe('prose-only')
    expect(deriveEffectsModelingStatus({ effects: [] })).toBe('prose-only')
    expect(
      deriveEffectsModelingStatus({
        effects: [
          {
            id: 'fx-1',
            kind: 'damage',
            roll: { dice: { count: 8, faces: 6 } },
            damageType: 'fire',
          },
        ],
      }),
    ).toBe('partially-modeled')
  })
})
