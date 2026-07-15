import { describe, expect, it } from 'vitest'

import {
  buildAtomicEffectDisplay,
  buildAtomicEffectDisplayFromParts,
  formatAtomicEffectDisplayTitle,
} from './atomic-effect-display'

describe('buildAtomicEffectDisplayFromParts', () => {
  it('builds damage title segments and recipient-aware summary', () => {
    const display = buildAtomicEffectDisplayFromParts(
      {
        kind: 'damage',
        roll: { dice: { count: 8, faces: 6 } },
        damageType: 'fire',
      },
      { recipient: 'target' },
    )

    expect(display.segments).toEqual({
      kindLabel: 'Damage',
      mechanicalSummary: '8d6 Fire damage',
    })
    expect(display.summary).toBe('Inflicts 8d6 Fire damage.')
    expect(formatAtomicEffectDisplayTitle(display)).toBe('Damage — 8d6 Fire damage')
  })

  it('includes custom label between kind and mechanical summary in plain text', () => {
    const display = buildAtomicEffectDisplayFromParts({
      kind: 'damage',
      label: 'Scorch',
      roll: { dice: { count: 8, faces: 6 } },
      damageType: 'fire',
    })

    expect(formatAtomicEffectDisplayTitle(display)).toBe('Damage — Scorch · 8d6 Fire damage')
  })

  it('omits summary when roll data is incomplete', () => {
    const display = buildAtomicEffectDisplayFromParts({
      kind: 'damage',
      damageType: 'fire',
    })

    expect(display.segments.mechanicalSummary).toBeUndefined()
    expect(display.summary).toBeUndefined()
    expect(formatAtomicEffectDisplayTitle(display)).toBe('Damage')
  })

  it('builds temporary hit points mechanical summary', () => {
    const display = buildAtomicEffectDisplayFromParts({
      kind: 'temporary-hit-points',
      roll: { dice: { count: 2, faces: 4 }, flat: 4 },
    })

    expect(formatAtomicEffectDisplayTitle(display)).toMatch(/^Temporary hit points — 2d4\+4/)
    expect(display.summary).toBe('Character gains 2d4+4 temporary Hit Points.')
  })

  it('uses fallback index when kind is missing', () => {
    const display = buildAtomicEffectDisplayFromParts({}, { fallbackIndex: 1 })

    expect(display.segments.kindLabel).toBe('Effect 2')
    expect(formatAtomicEffectDisplayTitle(display)).toBe('Effect 2')
  })
})

describe('buildAtomicEffectDisplay', () => {
  it('builds from a normalized spell atomic effect', () => {
    const display = buildAtomicEffectDisplay({
      id: 'fx-1',
      kind: 'healing',
      label: 'Restoration',
      roll: { dice: { count: 2, faces: 8 } },
    })

    expect(formatAtomicEffectDisplayTitle(display)).toBe('Healing — Restoration · 2d8 healing')
    expect(display.summary).toBe('Character heals 2d8 Hit Points.')
  })
})
