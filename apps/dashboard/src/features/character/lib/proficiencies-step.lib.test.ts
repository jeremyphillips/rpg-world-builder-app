import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft, resolveAvailableChoices } from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from './character-builder-fixtures'
import { choiceSetsForProficienciesStep } from './proficiencies-step.lib'

describe('choiceSetsForProficienciesStep', () => {
  it('includes language ChoiceSets for the proficiencies step', () => {
    const context = createPopulatedStandaloneBuilderContextFixture()
    const choiceSets = resolveAvailableChoices(createEmptyCharacterBuilderDraft(), context)

    expect(
      choiceSetsForProficienciesStep(choiceSets).some((cs) => cs.choiceType === 'language'),
    ).toBe(true)
  })
})
