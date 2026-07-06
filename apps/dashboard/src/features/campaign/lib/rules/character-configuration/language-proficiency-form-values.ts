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
  from: [...DEFAULT_LANGUAGE_PROFICIENCY_CHOICES[0].from],
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
      categories: [...grants.categories],
    },
    languageProficiencyChoice: {
      choose: choice?.choose ?? DEFAULT_LANGUAGE_CHOICE_FORM.choose,
      categories: [...(choice?.categories ?? DEFAULT_LANGUAGE_CHOICE_FORM.categories)],
      from: [...(choice?.from ?? DEFAULT_LANGUAGE_CHOICE_FORM.from)],
    },
  }
}

export function languageProficiencyRulesDefaultValues(): LanguageProficiencyRulesForm {
  return {
    languageProficiencyGrants: {
      items: [...DEFAULT_LANGUAGE_PROFICIENCY_GRANT.items],
      categories: [...DEFAULT_LANGUAGE_PROFICIENCY_GRANT.categories],
    },
    languageProficiencyChoice: {
      choose: DEFAULT_LANGUAGE_CHOICE_FORM.choose,
      categories: [...DEFAULT_LANGUAGE_CHOICE_FORM.categories],
      from: [...DEFAULT_LANGUAGE_CHOICE_FORM.from],
    },
  }
}

/** Persists language grants and the first language choice package from form state. */
export function buildLanguageProficiencyPatchInput(
  values: LanguageProficiencyRulesForm,
  existingChoice?: LanguageProficiencyChoice,
): {
  proficiencyGrants: NonNullable<UpdateCampaignCharacterCreationInput['proficiencyGrants']>
  proficiencyChoices: NonNullable<UpdateCampaignCharacterCreationInput['proficiencyChoices']>
} {
  const { items, categories } = values.languageProficiencyGrants
  const choice = values.languageProficiencyChoice

  return {
    proficiencyGrants: {
      languages: { items, categories },
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
          from: choice.from,
        },
      ],
    },
  }
}
