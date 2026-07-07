import { describe, expect, it } from 'vitest'

import type { Spell } from '../../../../content/spell'
import {
  buildSpellPickerSearchText,
  formatSpellConcentrationMarker,
  formatSpellPickerCastingTime,
  formatSpellPickerComponents,
  formatSpellPickerDuration,
  formatSpellPickerLevelLabel,
  formatSpellPickerRange,
  formatSpellPickerSummaryLine,
  formatSpellRitualMarker,
  SPELL_PICKER_CANTrip_LEVEL_LABEL,
} from './format-spell-picker-metadata'

const baseSpell = {
  id: 'srd-cc-5.2.1:fireball',
  slug: 'fireball',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Fireball',
  description: '<p>A bright streak flashes from your pointing finger.</p>',
  school: 'evocation',
  level: 3,
  classIds: ['wizard'],
  tags: { roles: ['damage'] },
  castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
  range: { kind: 'distance', value: { value: 150, unit: 'ft' } },
  duration: { kind: 'instantaneous' },
  components: {
    verbal: true,
    somatic: true,
    material: { description: 'a tiny ball of bat guano' },
  },
} satisfies Spell

describe('formatSpellPickerLevelLabel', () => {
  it('labels cantrips and leveled spells', () => {
    expect(formatSpellPickerLevelLabel(0)).toBe(SPELL_PICKER_CANTrip_LEVEL_LABEL)
    expect(formatSpellPickerLevelLabel(1)).toBe('Level 1')
    expect(formatSpellPickerLevelLabel(3)).toBe('Level 3')
  })
})

describe('formatSpellPickerCastingTime', () => {
  it('formats common casting time units', () => {
    expect(
      formatSpellPickerCastingTime({
        normal: { value: 1, unit: 'action' },
        canBeCastAsRitual: false,
      }),
    ).toBe('Action')
    expect(
      formatSpellPickerCastingTime({
        normal: { value: 10, unit: 'minute' },
        canBeCastAsRitual: true,
      }),
    ).toBe('10 Minutes')
  })
})

describe('formatSpellPickerRange', () => {
  it('formats distance and self ranges', () => {
    expect(formatSpellPickerRange({ kind: 'self' })).toBe('Self')
    expect(formatSpellPickerRange({ kind: 'distance', value: { value: 120, unit: 'ft' } })).toBe(
      '120 ft.',
    )
  })
})

describe('formatSpellPickerDuration', () => {
  it('formats instantaneous and concentration durations', () => {
    expect(formatSpellPickerDuration({ kind: 'instantaneous' })).toBe('Instantaneous')
    expect(
      formatSpellPickerDuration({
        kind: 'timed',
        value: 10,
        unit: 'minute',
        concentration: true,
        upTo: true,
      }),
    ).toBe('Concentration, up to 10 minutes')
  })
})

describe('formatSpellPickerComponents', () => {
  it('joins verbal, somatic, and material components', () => {
    expect(formatSpellPickerComponents(baseSpell.components)).toBe(
      'V, S, M (a tiny ball of bat guano)',
    )
  })
})

describe('formatSpellConcentrationMarker', () => {
  it('returns Concentration only for timed concentration spells', () => {
    expect(formatSpellConcentrationMarker({ kind: 'instantaneous' })).toBeUndefined()
    expect(
      formatSpellConcentrationMarker({
        kind: 'timed',
        value: 1,
        unit: 'minute',
        concentration: true,
      }),
    ).toBe('Concentration')
  })
})

describe('formatSpellRitualMarker', () => {
  it('returns Ritual when the spell can be cast as a ritual', () => {
    expect(
      formatSpellRitualMarker({ normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false }),
    ).toBeUndefined()
    expect(
      formatSpellRitualMarker({ normal: { value: 1, unit: 'action' }, canBeCastAsRitual: true }),
    ).toBe('Ritual')
  })
})

describe('formatSpellPickerSummaryLine', () => {
  it('joins level, school, casting time, range, duration, and tags', () => {
    expect(formatSpellPickerSummaryLine(baseSpell)).toBe(
      'Level 3 · Evocation · Action · 150 ft. · Instantaneous · damage',
    )
  })
})

describe('buildSpellPickerSearchText', () => {
  it('includes name, school, level labels, tags, and plain description text', () => {
    const searchText = buildSpellPickerSearchText(baseSpell)
    expect(searchText).toContain('Fireball')
    expect(searchText).toContain('Evocation')
    expect(searchText).toContain('damage')
    expect(searchText).toContain('bright streak flashes')
    expect(searchText).not.toContain('<p>')
  })
})
