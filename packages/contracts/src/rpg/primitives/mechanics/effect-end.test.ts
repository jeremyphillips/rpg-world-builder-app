import { describe, expect, it } from 'vitest'

import {
  buildEffectEndFromAuthoring,
  effectEndSchema,
  EFFECT_END_TIMING_OPTION_IDS,
  formatEffectEnd,
  resolveSelectIdFromEffectEnd,
} from './effect-end'

describe('effectEndSchema', () => {
  it('accepts turn-bound, timed, and custom ends', () => {
    expect(
      effectEndSchema.parse({
        kind: 'turn-bound',
        participant: 'source',
        boundary: 'start',
        which: 'next',
      }),
    ).toEqual({
      kind: 'turn-bound',
      participant: 'source',
      boundary: 'start',
      which: 'next',
    })
    expect(effectEndSchema.parse({ kind: 'timed', value: 1, unit: 'minute' })).toEqual({
      kind: 'timed',
      value: 1,
      unit: 'minute',
    })
    expect(effectEndSchema.parse({ kind: 'custom', text: 'until the curse ends' })).toEqual({
      kind: 'custom',
      text: 'until the curse ends',
    })
  })

  it('rejects invalid turn-bound tuples and timed quantities', () => {
    expect(
      effectEndSchema.safeParse({
        kind: 'turn-bound',
        participant: 'source',
        boundary: 'start',
        which: 'current',
      }).success,
    ).toBe(true)
    expect(effectEndSchema.safeParse({ kind: 'timed', value: 0, unit: 'minute' }).success).toBe(
      false,
    )
    expect(effectEndSchema.safeParse({ kind: 'custom', text: '   ' }).success).toBe(false)
  })
})

describe('effect end timing option registry', () => {
  it('round-trips supported turn-bound combinations', () => {
    const end = {
      kind: 'turn-bound' as const,
      participant: 'source' as const,
      boundary: 'start' as const,
      which: 'next' as const,
    }
    const id = resolveSelectIdFromEffectEnd(end)
    expect(id).toBe(EFFECT_END_TIMING_OPTION_IDS.sourceStartNext)
    expect(buildEffectEndFromAuthoring(id, {})).toEqual(end)
  })

  it('maps timed and custom ends to select ids', () => {
    expect(resolveSelectIdFromEffectEnd({ kind: 'timed', value: 2, unit: 'hour' })).toBe(
      EFFECT_END_TIMING_OPTION_IDS.timed,
    )
    expect(resolveSelectIdFromEffectEnd({ kind: 'custom', text: 'until dispelled' })).toBe(
      EFFECT_END_TIMING_OPTION_IDS.custom,
    )
  })

  it('builds timed and custom ends from authoring input', () => {
    expect(
      buildEffectEndFromAuthoring(EFFECT_END_TIMING_OPTION_IDS.timed, {
        timedValue: 1,
        timedUnit: 'minute',
      }),
    ).toEqual({ kind: 'timed', value: 1, unit: 'minute' })
    expect(
      buildEffectEndFromAuthoring(EFFECT_END_TIMING_OPTION_IDS.custom, {
        customText: ' until the curse ends ',
      }),
    ).toEqual({ kind: 'custom', text: 'until the curse ends' })
  })
})

describe('formatEffectEnd', () => {
  const monsterContext = { voice: 'monster-stat-block' as const, sourceName: 'Lich' }

  it('formats source and target turn boundaries', () => {
    expect(
      formatEffectEnd(
        {
          kind: 'turn-bound',
          participant: 'source',
          boundary: 'start',
          which: 'next',
        },
        monsterContext,
      ),
    ).toBe("until the start of the lich's next turn")
    expect(
      formatEffectEnd(
        {
          kind: 'turn-bound',
          participant: 'target',
          boundary: 'end',
          which: 'next',
        },
        monsterContext,
      ),
    ).toBe("until the end of the target's next turn")
  })

  it('formats timed and custom ends', () => {
    expect(formatEffectEnd({ kind: 'timed', value: 1, unit: 'minute' }, monsterContext)).toBe(
      'for 1 minute',
    )
    expect(formatEffectEnd({ kind: 'timed', value: 2, unit: 'hour' }, monsterContext)).toBe(
      'for 2 hours',
    )
    expect(formatEffectEnd({ kind: 'custom', text: 'until the curse ends' }, monsterContext)).toBe(
      'until the curse ends',
    )
  })

  it('uses caster voice for source turn-bound phrasing', () => {
    expect(
      formatEffectEnd(
        {
          kind: 'turn-bound',
          participant: 'source',
          boundary: 'end',
          which: 'next',
        },
        { voice: 'spell-caster' },
      ),
    ).toBe('until the end of your next turn')
  })
})
