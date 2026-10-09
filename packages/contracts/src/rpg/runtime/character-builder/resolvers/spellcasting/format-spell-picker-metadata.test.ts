import { describe, expect, it } from 'vitest'

import type { Spell } from '../../../../content/spell'
import {
  buildSpellPickerSearchText,
  getSpellSearchDescription,
  getSpellSearchLevelLabels,
  getSpellSearchName,
  getSpellSearchSchoolLabel,
  getSpellSearchTags,
  formatSpellConcentrationMarker,
  formatSpellPickerCastingTime,
  formatSpellPickerComponents,
  formatSpellPickerDuration,
  formatSpellPickerLevelLabel,
  formatSpellPickerRange,
  formatSpellRitualMarker,
  SPELL_PICKER_CANTrip_LEVEL_LABEL,
} from './format-spell-picker-metadata'

const baseSpell = {
  id: 'srd-cc-5.2.1:fireball',
  slug: 'fireball',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
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
    expect(formatSpellPickerLevelLabel(1)).toBe('1st level')
    expect(formatSpellPickerLevelLabel(3)).toBe('3rd level')
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
    ).toBe('10 minutes')
  })
})

describe('formatSpellPickerRange', () => {
  it('formats distance and self ranges without trailing periods', () => {
    expect(formatSpellPickerRange({ kind: 'self' })).toBe('Self')
    expect(formatSpellPickerRange({ kind: 'distance', value: { value: 120, unit: 'ft' } })).toBe(
      '120 ft',
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

describe('buildSpellPickerSearchText', () => {
  it('includes name, school, level labels, tags, and plain description text', () => {
    const searchText = buildSpellPickerSearchText(baseSpell)
    expect(searchText).toBe(
      'Fireball Evocation 3rd 3rd level damage A bright streak flashes from your pointing finger.',
    )
    expect(searchText).not.toContain('<p>')
  })

  it('joins the field helpers without changing the combined text', () => {
    const tags = getSpellSearchTags(baseSpell)
    expect(buildSpellPickerSearchText(baseSpell)).toBe(
      [
        getSpellSearchName(baseSpell),
        getSpellSearchSchoolLabel(baseSpell),
        ...getSpellSearchLevelLabels(baseSpell),
        tags.join(' ') || undefined,
        getSpellSearchDescription(baseSpell) || undefined,
      ]
        .filter(Boolean)
        .join(' '),
    )
    expect(getSpellSearchLevelLabels({ ...baseSpell, level: 0 })).toEqual(['Cantrip', 'Cantrip'])
  })
})
