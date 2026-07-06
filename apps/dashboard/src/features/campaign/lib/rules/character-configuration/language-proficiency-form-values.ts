import {
  DEFAULT_LANGUAGE_PROFICIENCY_CHOICES,
  DEFAULT_LANGUAGE_PROFICIENCY_GRANT,
  ORIGIN_LANGUAGES_CHOICE_ID,
  type LanguageProficiencyChoice,
  type ResolvedCampaignCharacterCreationPatch,
  type UpdateCampaignCharacterCreationInput,
} from '@rpg/contracts'

import type { LanguageProficiencyRulesForm } from './language-proficiency-form-fields'

const DEFAULT_LANGUAGE_CHOICE_FORM = {
  choose: DEFAULT_LANGUAGE_PROFICIENCY_CHOICES[0].choose,
  categories: [...DEFAULT_LANGUAGE_PROFICIENCY_CHOICES[0].categories],
} as const

/** Maps resolved ruleset language proficiency rules into flat form state (first choice only). */
export function mapLanguageProficiencyRulesToFormValues(
  characterCreation: ResolvedCampaignCharacterCreationPatch,
): LanguageProficiencyRulesForm {
  const grants = characterCreation.proficiencyGrants.languages
  const choice = characterCreation.proficiencyChoices.languages[0]

  return {
    languageProficiencyGrants: {
      items: [...grants.items],
    },
    languageProficiencyChoice: {
      choose: choice?.choose ?? DEFAULT_LANGUAGE_CHOICE_FORM.choose,
      categories: [...(choice?.categories ?? DEFAULT_LANGUAGE_CHOICE_FORM.categories)],
    },
  }
}

export function languageProficiencyRulesDefaultValues(): LanguageProficiencyRulesForm {
  return {
    languageProficiencyGrants: {
      items: [...DEFAULT_LANGUAGE_PROFICIENCY_GRANT.items],
    },
    languageProficiencyChoice: {
      choose: DEFAULT_LANGUAGE_CHOICE_FORM.choose,
      categories: [...DEFAULT_LANGUAGE_CHOICE_FORM.categories],
    },
  }
}

/**
 * Persists language grants and the first language choice package from form state.
 * Unsupported grant categories and explicit choice pools are canonicalized to `[]`.
 */
export function buildLanguageProficiencyPatchInput(
  values: LanguageProficiencyRulesForm,
  existingChoice?: LanguageProficiencyChoice,
): {
  proficiencyGrants: NonNullable<UpdateCampaignCharacterCreationInput['proficiencyGrants']>
  proficiencyChoices: NonNullable<UpdateCampaignCharacterCreationInput['proficiencyChoices']>
} {
  const { items } = values.languageProficiencyGrants
  const choice = values.languageProficiencyChoice

  return {
    proficiencyGrants: {
      languages: { items, categories: [] },
    },
    proficiencyChoices: {
      languages: [
        {
          id: existingChoice?.id ?? ORIGIN_LANGUAGES_CHOICE_ID,
          ...(existingChoice?.label
            ? { label: existingChoice.label }
            : { label: DEFAULT_LANGUAGE_PROFICIENCY_CHOICES[0].label }),
          choose: choice.choose,
          categories: choice.categories,
          from: [],
        },
      ],
    },
  }
}
