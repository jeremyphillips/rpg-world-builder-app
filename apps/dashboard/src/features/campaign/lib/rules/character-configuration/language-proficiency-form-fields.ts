import { z } from 'zod'
import { languageCategorySchema } from '@rpg/contracts'
import { type FieldOption, type FormItem, type FormNavigationAnchor } from '@rpg/ui/form'

import { languageGrantItemsField } from './language-grant-form-fields'

const SCROLL_SECTION_ANCHOR_CLASS = 'scroll-mt-20'

export const LANGUAGE_GRANTS_ITEMS_PATH = 'languageProficiencyGrants.items' as const
export const LANGUAGE_CHOICE_CHOOSE_PATH = 'languageProficiencyChoice.choose' as const
export const LANGUAGE_CHOICE_CATEGORIES_PATH = 'languageProficiencyChoice.categories' as const

/**
 * Dashboard v1 authoring supports only automatic language grants (`items`) and
 * category-based origin choices (`categories`). Contracts/runtime also accept
 * `proficiencyGrants.languages.categories` and `proficiencyChoices.languages[].from`;
 * form-values canonicalizes those unsupported fields to `[]` on save.
 *
 * First-choice-only: flat fields map to `proficiencyChoices.languages[0]` until
 * multi-package language choice UI exists.
 */
export const languageProficiencyGrantsFormSchema = z.object({
  items: z.array(z.string()),
})

export const languageProficiencyChoiceFormSchema = z.object({
  choose: z.coerce.number().int().min(0),
  categories: z.array(languageCategorySchema),
})

export const languageProficiencyRulesFormSchema = z.object({
  languageProficiencyGrants: languageProficiencyGrantsFormSchema,
  languageProficiencyChoice: languageProficiencyChoiceFormSchema,
})

export type LanguageProficiencyRulesForm = z.infer<typeof languageProficiencyRulesFormSchema>

export type LanguageProficiencyFieldsOptions = {
  navigation?: FormNavigationAnchor
}

/** Grant items plus first-package category choice for ruleset character creation. */
export function languageProficiencyFields(
  languageOptions: FieldOption[],
  languageCategoryOptions: FieldOption[],
  options: LanguageProficiencyFieldsOptions = {},
): FormItem[] {
  const navigation = options.navigation
  return [
    {
      kind: 'group',
      legend: 'Languages',
      ...(navigation?.id ? { id: navigation.id } : {}),
      ...(navigation ? { navigation } : {}),
      ...(navigation ? { className: SCROLL_SECTION_ANCHOR_CLASS } : {}),
      chrome: { variant: 'panel' },
      fields: [
        languageGrantItemsField({
          path: LANGUAGE_GRANTS_ITEMS_PATH,
          label: 'Granted languages',
          languageOptions,
        }),
        {
          type: 'inlineSentence',
          name: LANGUAGE_CHOICE_CATEGORIES_PATH,
          label: 'Language proficiency choice',
          labelVisibility: 'srOnly',
          segments: [
            { kind: 'text', value: 'Characters choose', tone: 'label' },
            {
              kind: 'number',
              name: LANGUAGE_CHOICE_CHOOSE_PATH,
              min: 0,
            },
            {
              kind: 'text',
              value: 'additional languages from these categories:',
              tone: 'label',
            },
          ],
          below: {
            kind: 'chips',
            name: LANGUAGE_CHOICE_CATEGORIES_PATH,
            options: languageCategoryOptions,
          },
        },
      ],
    },
  ]
}
