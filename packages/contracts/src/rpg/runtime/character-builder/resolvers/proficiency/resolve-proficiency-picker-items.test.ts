import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../../draft'
import { indexCharacterBuildCatalog } from '../../context'
import { assembleCharacterProficiencies } from '../../assembly/assemble-proficiencies'
import { PICKER_DISABLED_REASON_SELECTION_FULL } from '../picker/picker-item-state'
import { resolveClassSkillChoiceSets } from '../class/resolve-class-skill-choice-sets'
import { resolveLanguageChoiceSets } from '../ruleset/resolve-language-choice-sets'
import { resolveProficiencyPickerItems } from './resolve-proficiency-picker-items'
import {
  acrobaticsSkill,
  dwarfSpecies,
  perceptionSkill,
  proficiencyTestCatalog,
  proficiencyTestContext,
  rogueClass,
  stealthSkill,
} from '../../proficiency-test-fixtures'

describe('resolveProficiencyPickerItems', () => {
  const catalogIndex = indexCharacterBuildCatalog(proficiencyTestCatalog)

  it('disables unselected rows when the ChoiceSet is full', () => {
    const choiceSets = resolveClassSkillChoiceSets(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: rogueClass.id, level: 1 },
      },
      catalogIndex,
    )
    const choiceSetId = choiceSets[0]!.id
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: rogueClass.id, level: 1 as const },
      choiceSelections: {
        [choiceSetId]: [stealthSkill.id, acrobaticsSkill.id],
      },
    }
    const proficiencies = assembleCharacterProficiencies(
      draft,
      catalogIndex,
      choiceSets,
      rogueClass,
    )

    const items = resolveProficiencyPickerItems({
      draft,
      context: proficiencyTestContext,
      choiceSetId,
      proficiencies,
    })

    const selected = items.filter((item) => item.state.isAlreadySelected)
    const unselected = items.filter((item) => !item.state.isAlreadySelected)

    expect(selected.length).toBeGreaterThan(0)
    selected.forEach((item) => {
      expect(item.state.disabledReasons).toHaveLength(0)
    })

    expect(unselected).toHaveLength(1)
    expect(unselected[0]?.optionId).toBe(perceptionSkill.id)
    expect(unselected[0]?.state.canSelect).toBe(false)
    expect(unselected[0]?.state.disabledReasons).toContain(PICKER_DISABLED_REASON_SELECTION_FULL)
  })

  it('disables already-granted options that are not selected', () => {
    const choiceSets = resolveClassSkillChoiceSets(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: rogueClass.id, level: 1 },
      },
      catalogIndex,
    )
    const choiceSetId = choiceSets[0]!.id
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: rogueClass.id, level: 1 as const },
      choiceSelections: {
        [choiceSetId]: [acrobaticsSkill.id],
      },
    }
    const proficiencies = assembleCharacterProficiencies(draft, catalogIndex, choiceSets, {
      ...rogueClass,
      proficiencies: {
        ...rogueClass.proficiencies,
        skills: { categories: [], items: ['stealth'] },
      },
    })

    const items = resolveProficiencyPickerItems({
      draft,
      context: proficiencyTestContext,
      choiceSetId,
      proficiencies,
    })

    const stealth = items.find((item) => item.optionId === stealthSkill.id)
    expect(stealth?.state.isAlreadyGranted).toBe(true)
    expect(stealth?.state.canSelect).toBe(false)
    expect(stealth?.state.disabledReasons[0]).toContain('Already granted by')
  })

  it('marks species language affinities as recommended in language ChoiceSets', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: dwarfSpecies.id },
    }
    const choiceSets = resolveLanguageChoiceSets(draft, proficiencyTestContext)
    const choiceSetId = choiceSets[0]!.id
    const proficiencies = assembleCharacterProficiencies(draft, catalogIndex, choiceSets, undefined)

    const items = resolveProficiencyPickerItems({
      draft,
      context: proficiencyTestContext,
      choiceSetId,
      proficiencies,
    })

    const dwarvish = items.find((item) => item.optionId === 'dwarvish')
    const elvish = items.find((item) => item.optionId === 'elvish')

    expect(dwarvish?.state.isRecommended).toBe(true)
    expect(elvish?.state.isRecommended).toBe(false)
  })

  it('includes compactSummary for skill proficiency rows', () => {
    const choiceSets = resolveClassSkillChoiceSets(
      {
        ...createEmptyCharacterBuilderDraft(),
        class: { classId: rogueClass.id, level: 1 },
      },
      catalogIndex,
    )
    const choiceSetId = choiceSets[0]!.id
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: rogueClass.id, level: 1 as const },
    }
    const proficiencies = assembleCharacterProficiencies(
      draft,
      catalogIndex,
      choiceSets,
      rogueClass,
    )

    const items = resolveProficiencyPickerItems({
      draft,
      context: proficiencyTestContext,
      choiceSetId,
      proficiencies,
    })

    const stealth = items.find((item) => item.optionId === stealthSkill.id)
    expect(stealth?.compactSummary).toEqual({
      abilityLabel: 'Dexterity',
      exampleUses: stealthSkill.examples,
    })
  })
})
