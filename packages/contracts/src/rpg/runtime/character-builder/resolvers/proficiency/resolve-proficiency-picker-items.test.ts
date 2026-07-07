import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../../draft'
import { indexCharacterBuildCatalog } from '../../context'
import { assembleCharacterProficiencies } from '../../assembly/assemble-proficiencies'
import { PICKER_DISABLED_REASON_SELECTION_FULL } from '../picker/picker-item-state'
import { resolveClassSkillChoiceSets } from '../class/resolve-class-skill-choice-sets'
import { resolveProficiencyPickerItems } from './resolve-proficiency-picker-items'
import {
  acrobaticsSkill,
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
})
