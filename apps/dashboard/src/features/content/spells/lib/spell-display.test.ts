import { describe, expect, it } from 'vitest'

import { formatSlugAsLabel } from '@rpg/contracts'

import { pickSpell } from '../../lib/fixtures/pick'
import {
  buildSeedDamageTypeVocabulary,
  buildSeedSpellSchoolVocabulary,
  getDamageTypeLabelFromVocabulary,
  getSpellSchoolDescriptionFromVocabulary,
  getSpellSchoolLabelFromVocabulary,
} from '@/features/homebrew'
import { DETECT_MAGIC, FIRE_BOLT } from '../fixtures'
import { buildSpellDetailViewModel, SPELL_SECTION_LABELS, SPELL_STAT_LABELS } from './spell-display'
import {
  formatCastingTime,
  formatSpellComponents,
  formatSpellDuration,
  formatSpellLevelLabel,
  formatSpellRange,
} from './format-spell-metadata'

const HELLISH_REBUKE = pickSpell('hellish-rebuke')
const spellSchoolVocabulary = buildSeedSpellSchoolVocabulary()
const damageTypeVocabulary = buildSeedDamageTypeVocabulary()

function testVocabulary() {
  return {
    resolveSpellSchoolLabel: (schoolId: string) =>
      getSpellSchoolLabelFromVocabulary(spellSchoolVocabulary, schoolId),
    resolveSpellSchoolDescription: (schoolId: string) =>
      getSpellSchoolDescriptionFromVocabulary(spellSchoolVocabulary, schoolId),
    resolveDamageTypeLabel: (typeId: string) =>
      getDamageTypeLabelFromVocabulary(damageTypeVocabulary, typeId),
    resolveClassLabel: (slug: string) => formatSlugAsLabel(slug),
  }
}

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

describe('buildSpellDetailViewModel', () => {
  const vocabulary = testVocabulary()

  it('includes school description info beside the value', () => {
    const school = buildSpellDetailViewModel(FIRE_BOLT, vocabulary).statRows.find(
      (r) => r.label === SPELL_STAT_LABELS.school,
    )

    expect(school?.value).toBe('Evocation')
    expect(school?.info).toContain('Evocation spells')
    expect(school?.infoAriaLabel).toBe('About Evocation')
    expect(school?.infoPlacement).toBeUndefined()
  })

  it('includes ritual and concentration flags for detect magic', () => {
    const { statRows } = buildSpellDetailViewModel(DETECT_MAGIC, vocabulary)
    const ritual = statRows.find((r) => r.label === SPELL_STAT_LABELS.ritual)
    const concentration = statRows.find((r) => r.label === SPELL_STAT_LABELS.concentration)

    expect(ritual?.value).toBe('Yes')
    expect(ritual?.infoPlacement).toBe('label')
    expect(ritual?.info).toContain('ritual')

    expect(concentration?.value).toBe('Yes')
    expect(concentration?.infoPlacement).toBe('label')
    expect(concentration?.info).toContain('Concentration')

    expect(statRows.find((r) => r.label === SPELL_STAT_LABELS.level)?.value).toBe('1st')
  })

  it('includes delivery method when present', () => {
    const { statRows } = buildSpellDetailViewModel(FIRE_BOLT, vocabulary)
    expect(statRows.find((r) => r.label === SPELL_STAT_LABELS.delivery)?.value).toBe(
      'Ranged spell attack',
    )
  })

  it('omits classes row from stat rows', () => {
    const { statRows } = buildSpellDetailViewModel(FIRE_BOLT, vocabulary)
    expect(statRows.some((row) => row.label === SPELL_SECTION_LABELS.classes)).toBe(false)
  })

  it('builds classes section with resolved labels', () => {
    const viewModel = buildSpellDetailViewModel(FIRE_BOLT, vocabulary)

    expect(viewModel.classesSection).toEqual({
      title: SPELL_SECTION_LABELS.classes,
      items: [
        { slug: 'sorcerer', label: 'Sorcerer' },
        { slug: 'wizard', label: 'Wizard' },
      ],
    })
  })

  it('omits classes section when classIds is empty', () => {
    const spellWithoutClasses = { ...FIRE_BOLT, classIds: [] as string[] }
    expect(
      buildSpellDetailViewModel(spellWithoutClasses, vocabulary).classesSection,
    ).toBeUndefined()
  })

  it('builds tags section from roles, functions, damage types, and conditions', () => {
    const viewModel = buildSpellDetailViewModel(FIRE_BOLT, vocabulary)

    expect(viewModel.tagsSection).toEqual({
      title: SPELL_SECTION_LABELS.tags,
      labels: ['Damage', 'Fire'],
    })
  })

  it('omits tags section when spell has no tags', () => {
    const spellWithoutTags = { ...DETECT_MAGIC, tags: undefined }
    expect(buildSpellDetailViewModel(spellWithoutTags, vocabulary).tagsSection).toBeUndefined()
  })

  it('includes descriptionHtml when description is present', () => {
    expect(buildSpellDetailViewModel(FIRE_BOLT, vocabulary).descriptionHtml).toBe(
      FIRE_BOLT.description,
    )
  })

  it('omits descriptionHtml when description is absent or empty', () => {
    expect(
      buildSpellDetailViewModel({ ...FIRE_BOLT, description: undefined }, vocabulary)
        .descriptionHtml,
    ).toBeUndefined()
    expect(
      buildSpellDetailViewModel({ ...FIRE_BOLT, description: '' }, vocabulary).descriptionHtml,
    ).toBeUndefined()
  })
})
