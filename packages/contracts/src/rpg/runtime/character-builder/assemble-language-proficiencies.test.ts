import { describe, expect, it } from 'vitest'

import { ORIGIN_LANGUAGES_CHOICE_ID } from '../../content/character-creation-proficiencies'
import { LANGUAGE_GRANTS_SOURCE_ID } from '../character/languages'
import { createEmptyCharacterBuilderDraft } from './draft'
import {
  assembleLanguageProficiencyEntries,
  type CharacterLanguageAssemblyContext,
} from './assemble-language-proficiencies'
import { resolveLanguageChoiceSets } from './resolvers/resolve-language-choice-sets'
import { builderTestCatalog, builderTestContext } from './test-fixtures'

const languageContext: CharacterLanguageAssemblyContext = {
  rulesetId: builderTestContext.rulesetId,
  characterCreationRules: builderTestContext.characterCreationRules,
}

describe('assembleLanguageProficiencyEntries', () => {
  it('combines automatic grants and selected origin languages', () => {
    const choiceSets = resolveLanguageChoiceSets(
      createEmptyCharacterBuilderDraft(),
      builderTestContext,
    )
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      choiceSelections: {
        [choiceSets[0]!.id]: ['elvish', 'dwarvish'],
      },
    }

    expect(
      assembleLanguageProficiencyEntries(
        draft,
        languageContext,
        builderTestCatalog.languages,
        choiceSets,
      ),
    ).toEqual([
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
      {
        language: 'dwarvish',
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

  it('deduplicates repeated languages across grants and selections', () => {
    const choiceSets = resolveLanguageChoiceSets(
      createEmptyCharacterBuilderDraft(),
      builderTestContext,
    )
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      choiceSelections: {
        [choiceSets[0]!.id]: ['common', 'elvish'],
      },
    }

    expect(
      assembleLanguageProficiencyEntries(
        draft,
        languageContext,
        builderTestCatalog.languages,
        choiceSets,
      ),
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
})
