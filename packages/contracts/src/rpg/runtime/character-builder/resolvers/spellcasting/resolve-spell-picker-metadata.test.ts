import { describe, expect, it } from 'vitest'

import type { Spell } from '../../../../content/spell'
import {
  formatSpellPickerCompactDurationAmount,
  formatSpellPickerMetadataGroupLabel,
  MAX_SPELL_PICKER_METADATA_GROUPS,
  resolveSpellPickerMetadata,
  type SpellPickerMetadataGroup,
} from './resolve-spell-picker-metadata'

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
  components: { verbal: true, somatic: true },
} satisfies Spell

function spell(
  overrides: Partial<Spell> & Pick<Spell, 'name' | 'slug' | 'school' | 'level'>,
): Spell {
  return {
    ...baseSpell,
    id: `srd-cc-5.2.1:${overrides.slug}`,
    ...overrides,
  }
}

function groupKinds(groups: readonly SpellPickerMetadataGroup[]): string[] {
  return groups.map((group) => group.kind)
}

describe('formatSpellPickerCompactDurationAmount', () => {
  it('abbreviates minutes and keeps other units as words', () => {
    expect(formatSpellPickerCompactDurationAmount(1, 'minute')).toBe('1 min')
    expect(formatSpellPickerCompactDurationAmount(10, 'minute')).toBe('10 min')
    expect(formatSpellPickerCompactDurationAmount(1, 'hour')).toBe('1 hour')
    expect(formatSpellPickerCompactDurationAmount(8, 'hour')).toBe('8 hours')
    expect(formatSpellPickerCompactDurationAmount(1, 'round')).toBe('1 round')
    expect(formatSpellPickerCompactDurationAmount(2, 'day')).toBe('2 days')
  })
})

describe('resolveSpellPickerMetadata', () => {
  it('keeps classification, casting time, and self for Burning Hands', () => {
    const groups = resolveSpellPickerMetadata(
      spell({
        name: 'Burning Hands',
        slug: 'burning-hands',
        school: 'evocation',
        level: 1,
        range: { kind: 'self' },
        duration: { kind: 'instantaneous' },
      }),
    )

    expect(groups).toEqual([
      { kind: 'classification', levelLabel: '1st-level', schoolLabel: 'Evocation' },
      { kind: 'castingTime', label: 'Action' },
      { kind: 'range', label: 'Self' },
    ])
    expect(formatSpellPickerMetadataGroupLabel(groups[0]!)).toBe('1st-level Evocation')
    expect(groups.map((group) => formatSpellPickerMetadataGroupLabel(group))).not.toContain(
      'Instantaneous',
    )
  })

  it('keeps a compact non-concentration duration for Charm Person', () => {
    expect(
      resolveSpellPickerMetadata(
        spell({
          name: 'Charm Person',
          slug: 'charm-person',
          school: 'enchantment',
          level: 1,
          range: { kind: 'distance', value: { value: 30, unit: 'ft' } },
          duration: { kind: 'timed', value: 1, unit: 'hour' },
        }),
      ),
    ).toEqual([
      { kind: 'classification', levelLabel: '1st-level', schoolLabel: 'Enchantment' },
      { kind: 'castingTime', label: 'Action' },
      { kind: 'range', label: '30 ft' },
      { kind: 'duration', label: '1 hour' },
    ])
  })

  it('drops Self for Detect Magic so Ritual and concentration stay in display order', () => {
    const groups = resolveSpellPickerMetadata(
      spell({
        name: 'Detect Magic',
        slug: 'detect-magic',
        school: 'divination',
        level: 1,
        castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: true },
        range: { kind: 'self' },
        duration: {
          kind: 'timed',
          value: 10,
          unit: 'minute',
          concentration: true,
          upTo: true,
        },
      }),
    )

    expect(groups).toEqual([
      { kind: 'classification', levelLabel: '1st-level', schoolLabel: 'Divination' },
      { kind: 'ritual', label: 'Ritual' },
      { kind: 'castingTime', label: 'Action' },
      { kind: 'concentration', label: 'Concentration 10 min' },
    ])
    expect(groupKinds(groups)).toEqual(['classification', 'ritual', 'castingTime', 'concentration'])
    expect(groups.map((group) => formatSpellPickerMetadataGroupLabel(group)).join(' · ')).toBe(
      '1st-level Divination · Ritual · Action · Concentration 10 min',
    )
  })

  it('keeps Self when concentration still fits for Expeditious Retreat', () => {
    expect(
      resolveSpellPickerMetadata(
        spell({
          name: 'Expeditious Retreat',
          slug: 'expeditious-retreat',
          school: 'transmutation',
          level: 1,
          castingTime: { normal: { value: 1, unit: 'bonus-action' }, canBeCastAsRitual: false },
          range: { kind: 'self' },
          duration: {
            kind: 'timed',
            value: 10,
            unit: 'minute',
            concentration: true,
            upTo: true,
          },
        }),
      ),
    ).toEqual([
      { kind: 'classification', levelLabel: '1st-level', schoolLabel: 'Transmutation' },
      { kind: 'castingTime', label: 'Bonus action' },
      { kind: 'range', label: 'Self' },
      { kind: 'concentration', label: 'Concentration 10 min' },
    ])
  })

  it('selects exactly four groups when more facts are eligible', () => {
    const groups = resolveSpellPickerMetadata(
      spell({
        name: 'Tiny Hut',
        slug: 'tiny-hut',
        school: 'evocation',
        level: 3,
        castingTime: { normal: { value: 1, unit: 'minute' }, canBeCastAsRitual: true },
        range: { kind: 'distance', value: { value: 30, unit: 'ft' } },
        duration: {
          kind: 'timed',
          value: 8,
          unit: 'hour',
          concentration: true,
        },
      }),
    )

    expect(groups).toHaveLength(MAX_SPELL_PICKER_METADATA_GROUPS)
    expect(groupKinds(groups)).toEqual(['classification', 'ritual', 'castingTime', 'concentration'])
    expect(groups.map((group) => formatSpellPickerMetadataGroupLabel(group))).not.toContain('30 ft')
  })

  it('drops a timed duration before a non-self range when the budget is full', () => {
    const groups = resolveSpellPickerMetadata(
      spell({
        name: 'Identify',
        slug: 'identify',
        school: 'divination',
        level: 1,
        castingTime: { normal: { value: 1, unit: 'minute' }, canBeCastAsRitual: true },
        range: { kind: 'touch' },
        duration: { kind: 'timed', value: 1, unit: 'minute' },
      }),
    )

    expect(groups).toHaveLength(MAX_SPELL_PICKER_METADATA_GROUPS)
    expect(groupKinds(groups)).toEqual(['classification', 'ritual', 'castingTime', 'range'])
    expect(formatSpellPickerMetadataGroupLabel(groups[1]!)).toBe('Ritual')
    expect(formatSpellPickerMetadataGroupLabel(groups[3]!)).toBe('Touch')
  })

  it('keeps a special duration inside the budget without up-to phrasing', () => {
    const groups = resolveSpellPickerMetadata(
      spell({
        name: 'Continual Flame',
        slug: 'continual-flame',
        school: 'evocation',
        level: 2,
        range: { kind: 'touch' },
        duration: { kind: 'special', description: 'Until dispelled' },
      }),
    )

    expect(groups).toEqual([
      { kind: 'classification', levelLabel: '2nd-level', schoolLabel: 'Evocation' },
      { kind: 'castingTime', label: 'Action' },
      { kind: 'range', label: 'Touch' },
      { kind: 'duration', label: 'Until dispelled' },
    ])
  })
})
