import { type FieldOption, type FormItem } from '@rpg/ui/form'

export type LanguageGrantItemsFieldOptions = {
  path: string
  label: string
  hint?: string
  introText?: string
  languageOptions: FieldOption[]
  labelVisibility?: 'visible' | 'srOnly'
  separator?: 'subtle'
}

/** Shared granted-languages chips field for campaign language grant authoring. */
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

  return {
    type: 'chips',
    name: path,
    label,
    labelVisibility,
    introText,
    ...(hint ? { hint } : {}),
    options: languageOptions,
    separator,
  }
}
