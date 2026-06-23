import { describe, expect, it } from 'vitest'

import { pickSpell } from '../../lib/fixtures/pick'
import { DETECT_MAGIC, FIRE_BOLT } from '../fixtures'
import { buildSpellStatRows } from './spell-stat-rows'
import {
  formatCastingTime,
  formatSpellComponents,
  formatSpellDuration,
  formatSpellLevelLabel,
  formatSpellRange,
} from './format-spell-metadata'

const HELLISH_REBUKE = pickSpell('hellish-rebuke')

describe('formatSpellLevelLabel', () => {
  it('returns Cantrip for level 0', () => {
    expect(formatSpellLevelLabel(0)).toBe('Cantrip')
  })

  it('returns ordinal labels for leveled spells', () => {
    expect(formatSpellLevelLabel(1)).toBe('1st')
    expect(formatSpellLevelLabel(3)).toBe('3rd')
  })
})

describe('formatCastingTime', () => {
  it('formats a standard action casting time', () => {
    expect(formatCastingTime(FIRE_BOLT.castingTime)).toBe('1 Action')
  })

  it('includes reaction trigger text by default', () => {
    expect(formatCastingTime(HELLISH_REBUKE.castingTime)).toBe(
      '1 Reaction (in response to taking damage from a creature that you can see within 60 feet of yourself)',
    )
  })

  it('omits reaction trigger text when includeTrigger is false', () => {
    expect(formatCastingTime(HELLISH_REBUKE.castingTime, { includeTrigger: false })).toBe(
      '1 Reaction',
    )
  })
})

describe('formatSpellRange', () => {
  it('formats a distance range', () => {
    expect(formatSpellRange(FIRE_BOLT.range)).toBe('120 ft.')
  })

  it('formats a self range', () => {
    expect(formatSpellRange(DETECT_MAGIC.range)).toBe('Self')
  })
})

describe('formatSpellDuration', () => {
  it('formats instantaneous duration', () => {
    expect(formatSpellDuration(FIRE_BOLT.duration)).toBe('Instantaneous')
  })

  it('formats concentration duration with up to', () => {
    expect(formatSpellDuration(DETECT_MAGIC.duration)).toBe('Concentration, up to 10 minutes')
  })
})

describe('formatSpellComponents', () => {
  it('formats verbal and somatic components', () => {
    expect(formatSpellComponents(FIRE_BOLT.components)).toBe('V, S')
  })
})

describe('buildSpellStatRows', () => {
  it('includes school description info beside the value', () => {
    const school = buildSpellStatRows(FIRE_BOLT).find((r) => r.label === 'School')

    expect(school?.value).toBe('Evocation')
    expect(school?.info).toContain('Evocation spells')
    expect(school?.infoAriaLabel).toBe('About Evocation')
    expect(school?.infoPlacement).toBeUndefined()
  })

  it('includes ritual and concentration flags for detect magic', () => {
    const rows = buildSpellStatRows(DETECT_MAGIC)
    const ritual = rows.find((r) => r.label === 'Ritual')
    const concentration = rows.find((r) => r.label === 'Concentration')

    expect(ritual?.value).toBe('Yes')
    expect(ritual?.infoPlacement).toBe('label')
    expect(ritual?.info).toContain('ritual')

    expect(concentration?.value).toBe('Yes')
    expect(concentration?.infoPlacement).toBe('label')
    expect(concentration?.info).toContain('Concentration')

    expect(rows.find((r) => r.label === 'Level')?.value).toBe('1st')
  })

  it('includes delivery method when present', () => {
    const rows = buildSpellStatRows(FIRE_BOLT)
    expect(rows.find((r) => r.label === 'Delivery')?.value).toBe('Ranged spell attack')
  })
})
