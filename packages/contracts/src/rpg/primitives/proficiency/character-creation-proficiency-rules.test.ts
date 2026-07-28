import { describe, expect, it } from 'vitest'

import {
  DEFAULT_LANGUAGE_PROFICIENCY_CHOICES,
  DEFAULT_LANGUAGE_PROFICIENCY_GRANT,
  ORIGIN_LANGUAGES_CHOICE_ID,
  characterCreationProficiencyRulesPatchSchema,
  resolveCharacterCreationProficiencyRules,
} from './character-creation-proficiency-rules'

describe('characterCreationProficiencyRulesPatchSchema', () => {
  it('accepts automatic language grants and origin language choices', () => {
    expect(
      characterCreationProficiencyRulesPatchSchema.parse({
        proficiencyGrants: {
          languages: { items: ['common'], categories: [] },
        },
        proficiencyChoices: {
          languages: [
            {
              id: ORIGIN_LANGUAGES_CHOICE_ID,
              label: 'Origin Languages',
              choose: 2,
              categories: ['standard'],
            },
          ],
        },
      }),
    ).toEqual({
      proficiencyGrants: {
        languages: { items: ['common'], categories: [] },
      },
      proficiencyChoices: {
        languages: [
          {
            id: ORIGIN_LANGUAGES_CHOICE_ID,
            label: 'Origin Languages',
            choose: 2,
            categories: ['standard'],
            from: [],
          },
        ],
      },
    })
  })

  it('accepts an empty patch', () => {
    expect(characterCreationProficiencyRulesPatchSchema.parse({})).toEqual({})
  })
})

describe('resolveCharacterCreationProficiencyRules', () => {
  it('applies SRD defaults when patch is omitted', () => {
    expect(resolveCharacterCreationProficiencyRules()).toEqual({
      proficiencyGrants: {
        languages: DEFAULT_LANGUAGE_PROFICIENCY_GRANT,
      },
      proficiencyChoices: {
        languages: [...DEFAULT_LANGUAGE_PROFICIENCY_CHOICES],
      },
    })
  })

  it('merges sparse language grant overrides', () => {
    expect(
      resolveCharacterCreationProficiencyRules({
        proficiencyGrants: {
          languages: { items: ['common', 'elvish'], categories: [] },
        },
      }),
    ).toEqual({
      proficiencyGrants: {
        languages: { items: ['common', 'elvish'], categories: [] },
      },
      proficiencyChoices: {
        languages: [...DEFAULT_LANGUAGE_PROFICIENCY_CHOICES],
      },
    })
  })

  it('replaces language choice packages when provided', () => {
    const customChoices = [
      {
        id: 'bonus-languages',
        choose: 1,
        from: ['draconic'],
        categories: [],
      },
    ]

    expect(
      resolveCharacterCreationProficiencyRules({
        proficiencyChoices: { languages: [...customChoices] },
      }),
    ).toEqual({
      proficiencyGrants: {
        languages: DEFAULT_LANGUAGE_PROFICIENCY_GRANT,
      },
      proficiencyChoices: {
        languages: customChoices,
      },
    })
  })
})
