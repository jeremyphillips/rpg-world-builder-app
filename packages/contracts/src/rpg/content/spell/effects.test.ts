import { describe, expect, it } from 'vitest'

import {
  deriveEffectsModelingStatus,
  EFFECTS_MODELING_STATUS,
  EFFECTS_MODELING_STATUS_LABELS,
  formatAtomicEffectSummary,
  getEffectsModelingStatusLabel,
  formatAtomicEffectSummaries,
  formatDamageValue,
  formatEffectRowSentence,
  formatEffectRowTitle,
  formatEffectRowTitleFromParts,
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
        label: 'Mass restoration',
        roll: { dice: { count: 2, faces: 8 } },
      }),
    ).toMatchObject({ kind: 'healing', label: 'Mass restoration' })

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
        unitLabel: 'darts',
      }),
    ).toMatchObject({ count: 3, unitLabel: 'darts' })
  })

  it('rejects projectile-count without unitLabel', () => {
    expect(
      spellAtomicEffectSchema.safeParse({
        id: 'fx-5',
        kind: 'projectile-count',
        count: 3,
      }).success,
    ).toBe(false)
  })
})

describe('formatEffectRowTitle', () => {
  it('uses kind label alone when no distinguisher is set', () => {
    expect(
      formatEffectRowTitle({
        id: 'fx-1',
        kind: 'damage',
        roll: { dice: { count: 1, faces: 6 } },
        damageType: 'fire',
      }),
    ).toBe('Damage')
  })

  it('appends effect label or unit label after an em dash', () => {
    expect(
      formatEffectRowTitle({
        id: 'fx-2',
        kind: 'damage',
        label: 'Clenched Fist',
        roll: { dice: { count: 5, faces: 8 } },
        damageType: 'force',
      }),
    ).toBe('Damage — Clenched Fist')

    expect(
      formatEffectRowTitle({
        id: 'fx-3',
        kind: 'projectile-count',
        count: 3,
        unitLabel: 'darts',
      }),
    ).toBe('Projectile count — darts')
  })
})

describe('formatEffectRowTitleFromParts', () => {
  it('falls back when kind is missing', () => {
    expect(formatEffectRowTitleFromParts(undefined, {}, 0)).toBe('Effect 1')
  })
})

describe('formatEffectRowSentence', () => {
  it('formats grant-style authoring sentences', () => {
    expect(
      formatEffectRowSentence({
        id: 'fx-1',
        kind: 'damage',
        roll: { dice: { count: 1, faces: 6 } },
        damageType: 'fire',
      }),
    ).toBe('Inflicts 1d6 Fire damage.')

    expect(
      formatEffectRowSentence({
        id: 'fx-2',
        kind: 'damage',
        label: 'Clenched Fist',
        roll: { dice: { count: 5, faces: 8 } },
        damageType: 'force',
      }),
    ).toBe('Inflicts 5d8 Force damage.')

    expect(
      formatEffectRowSentence(
        {
          id: 'fx-3',
          kind: 'healing',
          label: 'Mass restoration',
          roll: { dice: { count: 3, faces: 8 } },
        },
        { recipient: 'self' },
      ),
    ).toBe('You heal 3d8 Hit Points.')

    expect(
      formatEffectRowSentence({
        id: 'fx-3',
        kind: 'healing',
        label: 'Mass restoration',
        roll: { dice: { count: 3, faces: 8 } },
      }),
    ).toBe('Character heals 3d8 Hit Points.')

    expect(
      formatEffectRowSentence({
        id: 'fx-4',
        kind: 'temporary-hit-points',
        roll: { dice: { count: 2, faces: 4 }, flat: 4 },
      }),
    ).toBe('Character gains 2d4+4 temporary Hit Points.')

    expect(
      formatEffectRowSentence({
        id: 'fx-5',
        kind: 'projectile-count',
        count: 3,
        unitLabel: 'darts',
      }),
    ).toBe('Creates 3 darts.')
  })
})

describe('formatAtomicEffectSummary', () => {
  it('formats compact detail lines without sentences', () => {
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
        unitLabel: 'darts',
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

describe('EFFECTS_MODELING_STATUS_LABELS', () => {
  it('covers every modeling status', () => {
    expect([...EFFECTS_MODELING_STATUS].sort()).toEqual(
      Object.keys(EFFECTS_MODELING_STATUS_LABELS).sort(),
    )
  })

  it('returns display labels for each status', () => {
    expect(getEffectsModelingStatusLabel('partially-modeled')).toBe('Partially modeled')
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
