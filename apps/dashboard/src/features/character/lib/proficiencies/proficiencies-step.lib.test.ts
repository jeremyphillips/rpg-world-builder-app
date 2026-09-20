import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft, resolveAvailableChoices } from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from '../fixtures/character-builder-fixtures'
import {
  choiceSetsForProficienciesStep,
  formatProficiencyChoiceAddLabel,
  formatProficiencyChosenCounter,
  reconcileProficiencyStepReadiness,
  validationIssuesForProficiencyChoiceSet,
  validationIssuesForProficiencySection,
} from './proficiencies-step.lib'
import {
  createProficienciesStepRogueContextFixture,
  createProficienciesStepRogueFixture,
} from './proficiencies-step.fixtures'

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

describe('validationIssuesForProficiencyChoiceSet', () => {
  it('returns issues targeted at the requested ChoiceSet id', () => {
    const issues = [
      {
        code: 'choice_set_unsatisfied',
        message: 'Choose at least 2 options for Rogue Skills.',
        stepId: 'proficiencies' as const,
        choiceSetId: 'class:srd-cc-5.2.1:rogue:class-skills',
      },
      {
        code: 'choice_set_unsatisfied',
        message: 'Choose an option for Keen Senses.',
        stepId: 'proficiencies' as const,
        choiceSetId: 'species:srd-cc-5.2.1:elf:keen-senses',
      },
    ]

    expect(
      validationIssuesForProficiencyChoiceSet(issues, 'class:srd-cc-5.2.1:rogue:class-skills'),
    ).toEqual([issues[0]])
  })
})

describe('validationIssuesForProficiencySection', () => {
  it('returns ChoiceSet issues only for single-block sections', () => {
    const { model } = createProficienciesStepRogueFixture()
    const skills = model.sections.find((section) => section.kind === 'skills')!
    const issues = [
      {
        code: 'choice_set_unsatisfied',
        message: 'Choose at least 2 options for Rogue Skills.',
        stepId: 'proficiencies' as const,
        choiceSetId: skills.choiceBlocks[0]!.choiceSet.id,
      },
    ]

    expect(validationIssuesForProficiencySection(issues, skills)).toEqual(issues)
    expect(
      validationIssuesForProficiencySection(issues, {
        choiceBlocks: [skills.choiceBlocks[0]!, skills.choiceBlocks[0]!],
      }),
    ).toEqual([])
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
