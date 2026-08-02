import { loadSeedSpells } from '@rpg/catalog/spells'
import { formatSlugAsLabel } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  buildSeedDamageTypeVocabulary,
  buildSeedSpellSchoolVocabulary,
  getDamageTypeLabelFromVocabulary,
  getSpellSchoolDescriptionFromVocabulary,
  getSpellSchoolLabelFromVocabulary,
} from '@/features/vocabulary'
import { pickSpell } from '../../lib/fixtures/pick'
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
const cureWounds = pickSpell('cure-wounds')
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

  it('includes area of effect when present', () => {
    const spell = {
      ...FIRE_BOLT,
      areaOfEffect: { shape: 'sphere' as const, radius: { value: 20, unit: 'ft' as const } },
    }
    const { statRows } = buildSpellDetailViewModel(spell, vocabulary)
    expect(statRows.find((r) => r.label === SPELL_STAT_LABELS.area)?.value).toBe(
      '20-ft-radius sphere',
    )
  })

  it('omits area row when areaOfEffect is absent', () => {
    const { statRows } = buildSpellDetailViewModel(FIRE_BOLT, vocabulary)
    expect(statRows.some((row) => row.label === SPELL_STAT_LABELS.area)).toBe(false)
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
    expect(viewModel.classLabels).toEqual(['Sorcerer', 'Wizard'])
  })

  it('omits classes section when classIds is empty', () => {
    const spellWithoutClasses = { ...FIRE_BOLT, classIds: [] as string[] }
    const viewModel = buildSpellDetailViewModel(spellWithoutClasses, vocabulary)

    expect(viewModel.classesSection).toBeUndefined()
    expect(viewModel.classLabels).toEqual([])
  })

  it('builds tags section from roles, functions, damage types, and conditions', () => {
    const viewModel = buildSpellDetailViewModel(FIRE_BOLT, vocabulary)

    expect(viewModel.tagsSection).toEqual({
      title: SPELL_SECTION_LABELS.tags,
      labels: ['Damage', 'Fire'],
    })
    expect(viewModel.tagLabels).toEqual(['Damage', 'Fire'])
  })

  it('omits tags section when spell has no tags', () => {
    const spellWithoutTags = { ...DETECT_MAGIC, tags: undefined }
    const viewModel = buildSpellDetailViewModel(spellWithoutTags, vocabulary)

    expect(viewModel.tagsSection).toBeUndefined()
    expect(viewModel.tagLabels).toEqual([])
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

  it('builds cantrip scaling prose section when structured progression is absent', () => {
    const spellWithoutProgression = {
      ...FIRE_BOLT,
      // Below display threshold so resolution UI does not suppress scaling prose.
      modeling: undefined,
      resolution: FIRE_BOLT.resolution
        ? (() => {
            const { progression: _progression, ...resolution } = FIRE_BOLT.resolution
            return resolution
          })()
        : undefined,
    }
    const viewModel = buildSpellDetailViewModel(spellWithoutProgression, vocabulary)

    expect(viewModel.proseSections.cantripScaling).toBe(FIRE_BOLT.cantripScaling)
    expect(viewModel.proseSections.higherLevelSlotEffect).toBeUndefined()
  })

  it('suppresses scaling prose when structured resolution progression is present', () => {
    const fireBolt = loadSeedSpells('srd-cc-5.2.1').find((spell) => spell.slug === 'fire-bolt')!
    const viewModel = buildSpellDetailViewModel(fireBolt, vocabulary)

    expect(fireBolt.resolution?.progression).toBeDefined()
    expect(fireBolt.cantripScaling).toBeTruthy()
    expect(viewModel.proseSections.cantripScaling).toBeUndefined()
    expect(viewModel.proseSections.higherLevelSlotEffect).toBeUndefined()
  })

  it('builds higher-level slot effect prose section from dedicated fields', () => {
    const spell = {
      ...DETECT_MAGIC,
      higherLevelSlotEffect: '<p>Targets one additional creature for each slot above 1.</p>',
    }
    const viewModel = buildSpellDetailViewModel(spell, vocabulary)

    expect(viewModel.proseSections.higherLevelSlotEffect).toBe(spell.higherLevelSlotEffect)
    expect(viewModel.proseSections.cantripScaling).toBeUndefined()
  })

  it('omits prose sections when scaling fields are absent or empty', () => {
    const detectMagicViewModel = buildSpellDetailViewModel(DETECT_MAGIC, vocabulary)
    expect(detectMagicViewModel.proseSections.cantripScaling).toBeUndefined()
    expect(detectMagicViewModel.proseSections.higherLevelSlotEffect).toBeUndefined()

    const fireBoltViewModel = buildSpellDetailViewModel(
      { ...FIRE_BOLT, cantripScaling: '' },
      vocabulary,
    )
    expect(fireBoltViewModel.proseSections.cantripScaling).toBeUndefined()
  })

  it('builds a detail view model with stat rows and higher-level prose for cure wounds', () => {
    const viewModel = buildSpellDetailViewModel(cureWounds)

    expect(viewModel.statRows.some((row) => row.label === 'Components')).toBe(true)
    expect(viewModel.descriptionHtml).toContain('2d8 plus your spellcasting ability modifier')
    expect(viewModel.proseSections.higherLevelSlotEffect).toContain(
      '2d8 for each spell slot level above 1',
    )
  })
})
