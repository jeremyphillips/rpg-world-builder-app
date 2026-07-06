import { describe, expect, it } from 'vitest'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'
import {
  DEFAULT_LANGUAGE_PROFICIENCY_CHOICES,
  ORIGIN_LANGUAGES_CHOICE_ID,
  resolveCharacterCreationPatch,
} from '@rpg/contracts'

import {
  buildLanguageProficiencyPatchInput,
  languageProficiencyRulesDefaultValues,
  mapLanguageProficiencyRulesToFormValues,
} from './language-proficiency-form-values'

describe('language-proficiency-form-values', () => {
  const resolved = resolveCharacterCreationPatch(
    undefined,
    getStandardStartingWealthRules('srd-cc-5.2.1'),
  )
  const defaultChoice = DEFAULT_LANGUAGE_PROFICIENCY_CHOICES[0]!

  it('maps resolved SRD defaults into flat form state', () => {
    expect(mapLanguageProficiencyRulesToFormValues(resolved)).toEqual(
      languageProficiencyRulesDefaultValues(),
    )
  })

  it('persists grants and the first language choice package only', () => {
    expect(
      buildLanguageProficiencyPatchInput({
        languageProficiencyGrants: {
          items: ['common', 'elvish'],
        },
        languageProficiencyChoice: {
          choose: 1,
          categories: ['standard'],
        },
      }),
    ).toEqual({
      proficiencyGrants: {
        languages: { items: ['common', 'elvish'], categories: [] },
      },
      proficiencyChoices: {
        languages: [
          {
            id: ORIGIN_LANGUAGES_CHOICE_ID,
            label: defaultChoice.label,
            choose: 1,
            categories: ['standard'],
            from: [],
          },
        ],
      },
    })
  })

  it('canonicalizes unsupported grant categories and explicit choice pools on save', () => {
    const patch = buildLanguageProficiencyPatchInput(
      mapLanguageProficiencyRulesToFormValues({
        ...resolved,
        proficiencyGrants: {
          languages: { items: ['common'], categories: ['standard'] },
        },
        proficiencyChoices: {
          languages: [
            {
              ...defaultChoice,
              from: ['elvish'],
            },
          ],
        },
      }),
    )

    expect(patch.proficiencyGrants?.languages?.categories).toEqual([])
    expect(patch.proficiencyChoices?.languages?.[0]?.from).toEqual([])
  })

  it('preserves an existing choice id and label on save', () => {
    const existingChoice = resolved.proficiencyChoices.languages[0]!

    const patch = buildLanguageProficiencyPatchInput(
      mapLanguageProficiencyRulesToFormValues(resolved),
      existingChoice,
    )
    const savedChoice = patch.proficiencyChoices.languages![0]!

    expect(savedChoice).toEqual({
      id: existingChoice.id,
      label: existingChoice.label,
      choose: defaultChoice.choose,
      categories: [...defaultChoice.categories],
      from: [],
    })
  })
})
