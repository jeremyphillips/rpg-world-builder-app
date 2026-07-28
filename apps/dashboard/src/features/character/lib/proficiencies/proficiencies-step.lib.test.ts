import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft, resolveAvailableChoices } from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../character-builder-fixtures'
import {
  choiceSetsForProficienciesStep,
  formatProficiencyChoiceAddLabel,
} from './proficiencies-step.lib'
import { createProficienciesStepRogueContextFixture } from './proficiencies-step.fixtures'

describe('choiceSetsForProficienciesStep', () => {
  it('includes language ChoiceSets for the proficiencies step', () => {
    const context = createPopulatedStandaloneBuilderContextFixture()
    const choiceSets = resolveAvailableChoices(createEmptyCharacterBuilderDraft(), context)

    expect(
      choiceSetsForProficienciesStep(choiceSets).some((cs) => cs.choiceType === 'language'),
    ).toBe(true)
  })
})

describe('formatProficiencyChoiceAddLabel', () => {
  it('returns the add label for an unfilled skill proficiency ChoiceSet', () => {
    const context = createProficienciesStepRogueContextFixture()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:rogue', level: 1 as const },
    }
    const choiceSet = choiceSetsForProficienciesStep(resolveAvailableChoices(draft, context)).find(
      (entry) => entry.choiceType === 'skillProficiency',
    )!

    expect(formatProficiencyChoiceAddLabel(choiceSet)).toBe('Add skill proficiency')
  })
})
