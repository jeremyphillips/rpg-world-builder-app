import { describe, expect, it } from 'vitest'

import { ORIGIN_LANGUAGES_CHOICE_ID } from '../../../content/character-creation-proficiencies'
import { createEmptyCharacterBuilderDraft } from '../draft'
import { indexCharacterBuildCatalog } from '../context'
import { resolveAvailableChoices } from './resolve-choices'
import {
  assembleLanguageProficiencies,
  deriveCharacterLanguages,
  LANGUAGE_GRANTS_SOURCE_ID,
  resolveGrantedLanguages,
  resolveLanguageChoiceSets,
} from './resolve-languages'
import { builderTestCatalog, builderTestContext } from '../test-fixtures'

const catalogIndex = indexCharacterBuildCatalog(builderTestCatalog)

describe('resolveGrantedLanguages', () => {
  it('includes automatic language grants from character creation rules', () => {
    expect(resolveGrantedLanguages(builderTestContext, catalogIndex)).toEqual([
      {
        language: 'common',
        sources: [
          {
            kind: 'characterCreation',
            sourceId: 'srd-cc-5.2.1',
            grantId: LANGUAGE_GRANTS_SOURCE_ID,
          },
        ],
      },
    ])
  })
})

describe('resolveLanguageChoiceSets', () => {
  it('emits the first origin language choice as a deterministic ChoiceSet', () => {
    const [choiceSet] = resolveLanguageChoiceSets(builderTestContext, catalogIndex)

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

    expect(resolveLanguageChoiceSets(context, catalogIndex)).toHaveLength(1)
  })

  it('is registered in resolveAvailableChoices', () => {
    const choiceSets = resolveAvailableChoices(
      createEmptyCharacterBuilderDraft(),
      builderTestContext,
    )

    expect(choiceSets.some((choiceSet) => choiceSet.choiceType === 'language')).toBe(true)
  })
})

describe('deriveCharacterLanguages', () => {
  it('combines automatic grants and selected origin languages', () => {
    const choiceSets = resolveLanguageChoiceSets(builderTestContext, catalogIndex)
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      choiceSelections: {
        [choiceSets[0]!.id]: ['elvish', 'dwarvish'],
      },
    }

    expect(deriveCharacterLanguages(draft, builderTestContext, catalogIndex, choiceSets)).toEqual({
      granted: [
        {
          language: 'common',
          sources: [
            {
              kind: 'characterCreation',
              sourceId: 'srd-cc-5.2.1',
              grantId: LANGUAGE_GRANTS_SOURCE_ID,
            },
          ],
        },
      ],
      selected: [
        {
          language: 'elvish',
          choiceSetId: `ruleset:srd-cc-5.2.1:${ORIGIN_LANGUAGES_CHOICE_ID}`,
          sources: [
            {
              kind: 'characterCreation',
              sourceId: 'srd-cc-5.2.1',
              grantId: `ruleset:srd-cc-5.2.1:${ORIGIN_LANGUAGES_CHOICE_ID}`,
            },
          ],
        },
        {
          language: 'dwarvish',
          choiceSetId: `ruleset:srd-cc-5.2.1:${ORIGIN_LANGUAGES_CHOICE_ID}`,
          sources: [
            {
              kind: 'characterCreation',
              sourceId: 'srd-cc-5.2.1',
              grantId: `ruleset:srd-cc-5.2.1:${ORIGIN_LANGUAGES_CHOICE_ID}`,
            },
          ],
        },
      ],
      items: ['common', 'elvish', 'dwarvish'],
      unresolvedChoiceSetIds: [],
    })
  })

  it('deduplicates repeated languages across grants and selections', () => {
    const choiceSets = resolveLanguageChoiceSets(builderTestContext, catalogIndex)
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      choiceSelections: {
        [choiceSets[0]!.id]: ['common', 'elvish'],
      },
    }

    expect(
      assembleLanguageProficiencies(draft, builderTestContext, catalogIndex, choiceSets),
    ).toEqual([
      {
        language: 'common',
        sources: [
          {
            kind: 'characterCreation',
            sourceId: 'srd-cc-5.2.1',
            grantId: LANGUAGE_GRANTS_SOURCE_ID,
          },
          {
            kind: 'characterCreation',
            sourceId: 'srd-cc-5.2.1',
            grantId: `ruleset:srd-cc-5.2.1:${ORIGIN_LANGUAGES_CHOICE_ID}`,
          },
        ],
      },
      {
        language: 'elvish',
        sources: [
          {
            kind: 'characterCreation',
            sourceId: 'srd-cc-5.2.1',
            grantId: `ruleset:srd-cc-5.2.1:${ORIGIN_LANGUAGES_CHOICE_ID}`,
          },
        ],
      },
    ])
  })

  it('reports unresolved required language choice sets', () => {
    const choiceSets = resolveLanguageChoiceSets(builderTestContext, catalogIndex)

    expect(
      deriveCharacterLanguages(
        createEmptyCharacterBuilderDraft(),
        builderTestContext,
        catalogIndex,
        choiceSets,
      ).unresolvedChoiceSetIds,
    ).toEqual([`ruleset:srd-cc-5.2.1:${ORIGIN_LANGUAGES_CHOICE_ID}`])
  })
})
