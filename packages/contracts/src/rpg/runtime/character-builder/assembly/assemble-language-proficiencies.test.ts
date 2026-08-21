import { describe, expect, it } from 'vitest'

import type { ClassStored } from '../../../content/classes/class'
import { ORIGIN_LANGUAGES_CHOICE_ID } from '../../../primitives/proficiency/character-creation-proficiency-rules'
import { LANGUAGE_GRANTS_SOURCE_ID } from '../../character/sheet/languages'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import {
  assembleLanguageProficiencyEntries,
  type CharacterLanguageAssemblyContext,
} from './assemble-language-proficiencies'
import { resolveLanguageChoiceSets } from '../resolvers/ruleset/resolve-language-choice-sets'
import { builderTestCatalog, builderTestContext } from '../test-fixtures'

const languageContext: CharacterLanguageAssemblyContext = {
  rulesetId: builderTestContext.rulesetId,
  characterCreationRules: builderTestContext.characterCreationRules,
}

const druidClass = {
  id: 'srd-cc-5.2.1:druid',
  slug: 'druid',
  rulesetId: 'srd-cc-5.2.1',
  source: 'system',
  status: 'published',
  campaignId: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  name: 'Druid',
  primaryAbilities: ['wis'],
  hitDie: 8,
  proficiencies: {
    savingThrows: ['int', 'wis'],
    armor: { categories: ['light'], items: [] },
    weapons: { categories: ['simple'], items: [] },
    skills: { categories: [], items: [] },
  },
  features: [
    {
      kind: 'custom',
      id: 'druidic',
      name: 'Druidic',
      level: 1,
      grantGroups: [
        {
          grants: [
            {
              kind: 'spells',
              ability: 'wis',
              availability: 'always_prepared',
              spellIds: ['speak-with-animals'],
            },
            { kind: 'languages', languageIds: ['druidic'] },
          ],
        },
      ],
    },
  ],
} as const satisfies ClassStored

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

  it('assembles fixed languages grants from unlocked class features', () => {
    const choiceSets = resolveLanguageChoiceSets(
      createEmptyCharacterBuilderDraft(),
      builderTestContext,
    )
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      assembleLanguageProficiencyEntries(
        draft,
        languageContext,
        builderTestCatalog.languages,
        choiceSets,
        druidClass,
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
        language: 'druidic',
        sources: [
          {
            kind: 'classFeature',
            sourceId: 'srd-cc-5.2.1:druid',
            grantId: 'druidic',
          },
        ],
      },
    ])
  })
})
