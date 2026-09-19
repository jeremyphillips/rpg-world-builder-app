import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft, resolveAvailableChoices } from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../fixtures/character-builder-fixtures'
import {
  choiceSetsForProficienciesStep,
  formatProficiencyChoiceAddLabel,
  formatProficiencyChosenCounter,
  reconcileProficiencyStepReadiness,
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

describe('formatProficiencyChosenCounter', () => {
  it('formats chosen counts for section and block labels', () => {
    expect(formatProficiencyChosenCounter(1, 2)).toBe('1 / 2 chosen')
  })
})

describe('reconcileProficiencyStepReadiness', () => {
  it('downgrades complete and readyEmpty when class prerequisites are unresolved', () => {
    expect(
      reconcileProficiencyStepReadiness(
        { readiness: 'complete', message: 'Done' },
        { hasUnresolvedPrerequisites: true },
      ),
    ).toEqual({ readiness: 'readyWithChoices' })

    expect(
      reconcileProficiencyStepReadiness(
        { readiness: 'readyEmpty', message: 'Nothing to choose' },
        { hasUnresolvedPrerequisites: true },
      ),
    ).toEqual({ readiness: 'readyWithChoices' })
  })

  it('preserves blocked readiness while class prerequisites are unresolved', () => {
    expect(
      reconcileProficiencyStepReadiness(
        {
          readiness: 'blocked',
          classDependentBlocked: true,
          message: 'Choose a class',
        },
        { hasUnresolvedPrerequisites: true },
      ),
    ).toEqual({
      readiness: 'blocked',
      classDependentBlocked: true,
      message: 'Choose a class',
    })
  })
})
