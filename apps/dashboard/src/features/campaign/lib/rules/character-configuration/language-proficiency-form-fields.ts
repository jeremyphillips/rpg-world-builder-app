import { z } from 'zod'
import { languageCategorySchema } from '@rpg/contracts'
import { type FieldOption, type FormItem } from '@rpg/ui/form'

import { buildLanguageCategoryFieldOptions } from '@/features/homebrew'

export const LANGUAGE_GRANTS_ITEMS_PATH = 'languageProficiencyGrants.items' as const
export const LANGUAGE_GRANTS_CATEGORIES_PATH = 'languageProficiencyGrants.categories' as const
export const LANGUAGE_CHOICE_CHOOSE_PATH = 'languageProficiencyChoice.choose' as const
export const LANGUAGE_CHOICE_CATEGORIES_PATH = 'languageProficiencyChoice.categories' as const
export const LANGUAGE_CHOICE_FROM_PATH = 'languageProficiencyChoice.from' as const

/**
 * First-choice-only outlier: flat choose/categories/from form fields map to
 * `proficiencyChoices.languages[0]` on save until multi-package language choice UI exists.
 */
export const languageProficiencyGrantsFormSchema = z.object({
  items: z.array(z.string()),
  categories: z.array(languageCategorySchema),
})

export const languageProficiencyChoiceFormSchema = z.object({
  choose: z.coerce.number().int().min(0),
  categories: z.array(languageCategorySchema),
  from: z.array(z.string()),
})

export const languageProficiencyRulesFormSchema = z.object({
  languageProficiencyGrants: languageProficiencyGrantsFormSchema,
  languageProficiencyChoice: languageProficiencyChoiceFormSchema,
})

export type LanguageProficiencyRulesForm = z.infer<typeof languageProficiencyRulesFormSchema>

/** Grant items/categories plus first-package language choice for ruleset character creation. */
export function languageProficiencyFields(languageOptions: FieldOption[]): FormItem[] {
  const languageCategoryOptions = buildLanguageCategoryFieldOptions()

  return [
    {
      kind: 'group',
      legend: 'Proficiencies',
      fields: [
        {
          kind: 'group',
          legend: 'Languages',
          legendSize: 'subsection',
          fields: [
            {
              type: 'inlineSentence',
              name: LANGUAGE_GRANTS_ITEMS_PATH,
              label: 'Granted languages',
              hideLabel: true,
              segments: [
                { kind: 'text', value: 'Characters receive these languages:', tone: 'label' },
              ],
              below: {
                kind: 'chips',
                name: LANGUAGE_GRANTS_ITEMS_PATH,
                options: languageOptions,
              },
            },
            {
              type: 'inlineSentence',
              name: LANGUAGE_GRANTS_CATEGORIES_PATH,
              label: 'Granted language categories',
              hideLabel: true,
              segments: [{ kind: 'text', value: 'and from language categories:', tone: 'label' }],
              below: {
                kind: 'chips',
                name: LANGUAGE_GRANTS_CATEGORIES_PATH,
                options: languageCategoryOptions,
              },
            },
            {
              type: 'inlineSentence',
              name: LANGUAGE_CHOICE_CATEGORIES_PATH,
              label: 'Language proficiency choice',
              hideLabel: true,
              segments: [
                { kind: 'text', value: 'Characters choose', tone: 'label' },
                {
                  kind: 'number',
                  name: LANGUAGE_CHOICE_CHOOSE_PATH,
                  min: 0,
                },
                { kind: 'text', value: 'additional languages from:', tone: 'label' },
              ],
              below: {
                kind: 'chips',
                name: LANGUAGE_CHOICE_CATEGORIES_PATH,
                options: languageCategoryOptions,
              },
            },
            {
              type: 'inlineSentence',
              name: LANGUAGE_CHOICE_FROM_PATH,
              label: 'Language choice pool',
              hideLabel: true,
              segments: [
                { kind: 'text', value: 'Or choose from specific languages:', tone: 'label' },
              ],
              below: {
                kind: 'chips',
                name: LANGUAGE_CHOICE_FROM_PATH,
                options: languageOptions,
              },
            },
          ],
        },
      ],
    },
  ]
}
