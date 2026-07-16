import { describe, expect, it } from 'vitest'

import { pickClass, pickEquipment } from '../../lib/fixtures/pick'
import { FIGHTER, ROGUE } from '../fixtures'

import {
  buildClassCardViewModel,
  buildClassDetailViewModel,
  CLASS_DISPLAY_NONE,
  CLASS_PROFICIENCY_ROW_LABELS,
  CLASS_SECTION_LABELS,
  CLASS_STAT_LABELS,
} from './class-display'

const vocabulary = {
  resolveToolLabel: (slug: string) => pickEquipment(slug).name,
}

function getProficienciesSection(viewModel: ReturnType<typeof buildClassDetailViewModel>) {
  const section = viewModel.sections.find((entry) => entry.id === 'proficiencies')
  if (!section || section.id !== 'proficiencies') {
    throw new Error('Expected proficiencies section')
  }
  return section
}

describe('class-display', () => {
  it('builds class card view model with ability summary and hit die', () => {
    expect(buildClassCardViewModel(FIGHTER)).toEqual({
      label: 'Fighter',
      description: 'Strength or Dexterity · d10 Hit Die',
    })
  })

  it('builds Fighter content-detail stat rows and granted proficiencies', () => {
    const viewModel = buildClassDetailViewModel(FIGHTER, vocabulary, {
      surface: 'content-detail',
    })

    expect(viewModel.statRows).toEqual([
      { label: CLASS_STAT_LABELS.hitDie, value: 'd10 per level' },
      { label: CLASS_STAT_LABELS.primaryAbilities, value: 'Strength, Dexterity' },
      { label: CLASS_STAT_LABELS.savingThrows, value: 'Strength, Constitution' },
    ])

    const proficiencies = getProficienciesSection(viewModel)

    expect(proficiencies.title).toBe(CLASS_SECTION_LABELS.proficiencies)
    expect(proficiencies.granted).toEqual([
      {
        id: 'armor-training',
        label: CLASS_PROFICIENCY_ROW_LABELS.armorTraining,
        value: 'Light armor, Medium armor, Heavy armor, Shields',
      },
      {
        id: 'weapons',
        label: CLASS_PROFICIENCY_ROW_LABELS.weapons,
        value: 'Simple weapons, Martial weapons',
      },
    ])
  })

  it('includes empty Tools and Languages choice rows on content-detail for Fighter', () => {
    const proficiencies = getProficienciesSection(
      buildClassDetailViewModel(FIGHTER, vocabulary, { surface: 'content-detail' }),
    )

    expect(proficiencies.choices).toEqual([
      {
        id: 'skills',
        label: CLASS_PROFICIENCY_ROW_LABELS.skills,
        choose: 2,
        optionSlugs: ['acrobatics', 'athletics', 'history', 'intimidation', 'perception'],
        choicePrefix: 'Choose 2 from',
        compactSummary: 'Choose 2 from 5 options',
      },
      {
        id: 'tools',
        label: CLASS_PROFICIENCY_ROW_LABELS.tools,
        choose: 0,
        optionSlugs: [],
        choicePrefix: '',
        compactSummary: CLASS_DISPLAY_NONE,
      },
      {
        id: 'languages',
        label: CLASS_PROFICIENCY_ROW_LABELS.languages,
        choose: 0,
        optionSlugs: [],
        choicePrefix: '',
        compactSummary: CLASS_DISPLAY_NONE,
      },
    ])
  })

  it('builds Rogue granted tools and skill choice pool', () => {
    const proficiencies = getProficienciesSection(
      buildClassDetailViewModel(ROGUE, vocabulary, { surface: 'content-detail' }),
    )

    expect(proficiencies.granted).toEqual([
      {
        id: 'armor-training',
        label: CLASS_PROFICIENCY_ROW_LABELS.armorTraining,
        value: 'Light armor',
      },
      {
        id: 'weapons',
        label: CLASS_PROFICIENCY_ROW_LABELS.weapons,
        value: 'Simple weapons, Martial weapons',
      },
      {
        id: 'tools',
        label: CLASS_PROFICIENCY_ROW_LABELS.tools,
        value: "Thieves' Tools",
      },
    ])

    const skillsRow = proficiencies.choices.find((row) => row.id === 'skills')
    expect(skillsRow).toMatchObject({
      choose: 4,
      optionSlugs: expect.arrayContaining(['acrobatics', 'stealth']),
      compactSummary: 'Choose 4 from 9 options',
    })
  })

  it('summarizes Bard tool choices with a semantic pool label', () => {
    const bard = pickClass('bard')
    const proficiencies = getProficienciesSection(
      buildClassDetailViewModel(bard, vocabulary, { surface: 'content-detail' }),
    )

    const toolsRow = proficiencies.choices.find((row) => row.id === 'tools')
    expect(toolsRow).toMatchObject({
      choose: 3,
      optionSlugs: [],
      compactSummary: 'Choose 3 from Musical Instrument',
    })
  })

  it('summarizes Monk tool choices with a semantic pool label', () => {
    const monk = pickClass('monk')
    const proficiencies = getProficienciesSection(
      buildClassDetailViewModel(monk, vocabulary, { surface: 'content-detail' }),
    )

    const toolsRow = proficiencies.choices.find((row) => row.id === 'tools')
    expect(toolsRow).toMatchObject({
      choose: 1,
      optionSlugs: [],
      compactSummary: "Choose 1 from Artisan's Tools and Musical Instrument",
    })
  })

  it('omits empty choice rows on builder-sheet', () => {
    const proficiencies = getProficienciesSection(
      buildClassDetailViewModel(FIGHTER, vocabulary, { surface: 'builder-sheet' }),
    )

    expect(proficiencies.choices).toEqual([
      {
        id: 'skills',
        label: CLASS_PROFICIENCY_ROW_LABELS.skills,
        choose: 2,
        optionSlugs: ['acrobatics', 'athletics', 'history', 'intimidation', 'perception'],
        choicePrefix: 'Choose 2 from',
        compactSummary: 'Choose 2 from 5 options',
      },
    ])
  })

  it('uses shorter hit die stat row on builder-sheet', () => {
    const { statRows } = buildClassDetailViewModel(FIGHTER, vocabulary, {
      surface: 'builder-sheet',
    })

    expect(statRows[0]).toEqual({ label: CLASS_STAT_LABELS.hitDie, value: 'd10' })
  })

  it('builds features section with all levels on content-detail', () => {
    const viewModel = buildClassDetailViewModel(FIGHTER, vocabulary, {
      surface: 'content-detail',
    })

    const features = viewModel.sections.find((section) => section.id === 'features')
    expect(features).toMatchObject({
      id: 'features',
      title: 'Fighter Class Features',
    })
    expect(features && 'items' in features ? features.items.length : 0).toBeGreaterThan(1)
    expect(
      features && 'items' in features
        ? features.items.some((item) => item.title === 'Second Wind')
        : false,
    ).toBe(true)
  })

  it('filters builder-sheet features to level 1 only', () => {
    const viewModel = buildClassDetailViewModel(FIGHTER, vocabulary, {
      surface: 'builder-sheet',
    })

    const features = viewModel.sections.find((section) => section.id === 'features')
    expect(features && 'items' in features ? features.items : []).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Fighting Style', level: 1 }),
        expect.objectContaining({ title: 'Second Wind', level: 1 }),
      ]),
    )
    expect(
      features && 'items' in features ? features.items.every((item) => item.level === 1) : false,
    ).toBe(true)
  })

  it('does not emit Suggested proficiencies copy in view model labels', () => {
    const viewModel = buildClassDetailViewModel(FIGHTER, vocabulary)

    const serialized = JSON.stringify(viewModel)
    expect(serialized).not.toContain('Suggested')
    expect(serialized).toContain(CLASS_SECTION_LABELS.proficiencies)
    expect(serialized).toContain(CLASS_PROFICIENCY_ROW_LABELS.skills)
  })
})
