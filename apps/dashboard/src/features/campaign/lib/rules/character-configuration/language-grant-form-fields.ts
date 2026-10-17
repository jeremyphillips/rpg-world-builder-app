import { type FieldOption, type FormItem } from '@rpg/ui/form'

import { languageMultiComboboxField } from '@/lib/forms/language-combobox-form-fields.lib'

export type LanguageGrantItemsFieldOptions = {
  path: string
  label: string
  hint?: string
  introText?: string
  languageOptions: FieldOption[]
  labelVisibility?: 'visible' | 'srOnly'
  separator?: 'subtle'
}

/** Shared granted-languages combobox field for campaign language grant authoring. */
export function languageGrantItemsField(options: LanguageGrantItemsFieldOptions): FormItem {
  const {
    path,
    label,
    hint,
    introText = 'Characters receive these languages:',
    languageOptions,
    labelVisibility = 'srOnly',
    separator = 'subtle',
  } = options

  return languageMultiComboboxField({
    name: path,
    label,
    labelVisibility,
    introText,
    ...(hint ? { hint } : {}),
    options: languageOptions,
    separator,
  })
}
