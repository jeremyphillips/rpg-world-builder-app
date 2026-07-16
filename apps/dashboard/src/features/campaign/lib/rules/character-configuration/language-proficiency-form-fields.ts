import { z } from 'zod'
import { languageCategorySchema } from '@rpg/contracts'
import { type FieldOption, type FormItem } from '@rpg/ui/form'

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

/** Grant items plus first-package category choice for ruleset character creation. */
export function languageProficiencyFields(
  languageOptions: FieldOption[],
  languageCategoryOptions: FieldOption[],
): FormItem[] {
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
      ],
    },
  ]
}
