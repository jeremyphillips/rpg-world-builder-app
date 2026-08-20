import { describe, expect, it } from 'vitest'

import { CLASS_SECTION_LABELS, CLASS_STAT_LABELS } from '@/features/content'
import { pickClass, pickSkillProficiency } from '@/features/content'

import { buildClassDetailsSheetContent } from './builder-class-option-display.lib'
import { populatedBuilderCatalog } from '../fixtures/character-builder-fixtures'

describe('builder-class-option-display.lib', () => {
  const fighter = pickClass('fighter')
  const catalog = {
    ...populatedBuilderCatalog,
    skillProficiencies:
      fighter.characterCreation?.proficiencies?.skills?.choices?.[0]?.from.map((slug) =>
        pickSkillProficiency(slug),
      ) ?? populatedBuilderCatalog.skillProficiencies,
  }

  it('builds class detail sheet metadata with shorter hit die', () => {
    const content = buildClassDetailsSheetContent(fighter, catalog)

    expect(content.title).toBe('Fighter')
    expect(content.eyebrow).toBe('Class')
    expect(content.metadata).toEqual(
      expect.arrayContaining([
        { label: CLASS_STAT_LABELS.hitDie, value: 'd10' },
        { label: CLASS_STAT_LABELS.primaryAbilities, value: 'Strength, Dexterity' },
        { label: CLASS_STAT_LABELS.savingThrows, value: 'Strength, Constitution' },
      ]),
    )
  })

  it('maps proficiencies with compact choice summaries and resolved option labels', () => {
    const content = buildClassDetailsSheetContent(fighter, catalog)
    const proficiencies = content.sections.find(
      (section) => section.title === CLASS_SECTION_LABELS.proficiencies,
    )

    expect(proficiencies?.items).toEqual(
      expect.arrayContaining([
        {
          title: 'Armor Training',
          body: 'Light armor, Medium armor, Heavy armor, Shields',
        },
        {
          title: 'Skills',
          optionPool: {
            summary: 'Choose 2 from 5 options',
            optionLabels: expect.arrayContaining([
              'Acrobatics',
              'Athletics',
              'History',
              'Intimidation',
              'Perception',
            ]),
          },
        },
      ]),
    )
    expect(proficiencies?.items?.find((item) => item.title === 'Tools')).toBeUndefined()
  })

  it('includes level-1 features only', () => {
    const content = buildClassDetailsSheetContent(fighter, catalog)
    const features = content.sections.find((section) => section.title === 'Fighter Class Features')

    expect(features?.items?.map((item) => item.title)).toEqual(
      expect.arrayContaining(['Fighting Style', 'Second Wind', 'Weapon Mastery']),
    )
    expect(features?.items?.some((item) => item.title === 'Action Surge')).toBe(false)
  })
})
