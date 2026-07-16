import { describe, expect, it } from 'vitest'

import { ORIGIN_LANGUAGES_CHOICE_ID } from '../../../../content/character-creation-proficiencies'
import { createEmptyCharacterBuilderDraft } from '../../draft'
import { resolveAvailableChoices } from '../registry/resolve-choices'
import { resolveLanguageChoiceSets } from './resolve-language-choice-sets'
import { builderTestContext } from '../../test-fixtures'

describe('resolveLanguageChoiceSets', () => {
  it('emits the first origin language choice as a deterministic ChoiceSet', () => {
    const [choiceSet] = resolveLanguageChoiceSets(
      createEmptyCharacterBuilderDraft(),
      builderTestContext,
    )

    expect(choiceSet).toEqual({
      id: `ruleset:srd-cc-5.2.1:${ORIGIN_LANGUAGES_CHOICE_ID}`,
      sourceType: 'ruleset',
      sourceId: 'srd-cc-5.2.1',
      choiceType: 'language',
      label: 'Origin Languages',
      min: 2,
      max: 2,
      options: [
        { id: 'common', label: 'Common' },
        { id: 'elvish', label: 'Elvish' },
        { id: 'dwarvish', label: 'Dwarvish' },
        { id: 'draconic', label: 'Draconic' },
      ],
      required: true,
    })
  })

  it('ignores choices after the first meaningful language package', () => {
    const context = {
      ...builderTestContext,
      characterCreationRules: {
        ...builderTestContext.characterCreationRules,
        proficiencyChoices: {
          languages: [
            ...builderTestContext.characterCreationRules.proficiencyChoices.languages,
            {
              id: 'bonus-language',
              label: 'Bonus Language',
              choose: 1,
              from: ['abyssal'],
              categories: [],
            },
          ],
        },
      },
    }

    expect(resolveLanguageChoiceSets(createEmptyCharacterBuilderDraft(), context)).toHaveLength(1)
  })

  it('emits no ChoiceSet when choose is zero', () => {
    const context = {
      ...builderTestContext,
      characterCreationRules: {
        ...builderTestContext.characterCreationRules,
        proficiencyChoices: {
          languages: [
            {
              id: 'origin-languages',
              label: 'Origin Languages',
              choose: 0,
              from: [] as string[],
              categories: ['standard'] as const,
            },
          ],
        },
      },
    } satisfies typeof builderTestContext

    expect(resolveLanguageChoiceSets(createEmptyCharacterBuilderDraft(), context)).toEqual([])
  })

  it('emits no ChoiceSet when no language choices exist', () => {
    const context = {
      ...builderTestContext,
      characterCreationRules: {
        ...builderTestContext.characterCreationRules,
        proficiencyChoices: {
          languages: [],
        },
      },
    }

    expect(resolveLanguageChoiceSets(createEmptyCharacterBuilderDraft(), context)).toEqual([])
  })

  it('is registered in resolveAvailableChoices', () => {
    const choiceSets = resolveAvailableChoices(
      createEmptyCharacterBuilderDraft(),
      builderTestContext,
    )

    expect(choiceSets.some((choiceSet) => choiceSet.choiceType === 'language')).toBe(true)
  })
})
