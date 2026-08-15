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

/** Shared granted-languages chips composition for campaign language grant fields. */
export function languageGrantItemsField(options: LanguageGrantItemsFieldOptions): FormItem {
  const {
    path,
    label,
    hint,
    introText = 'Characters receive these languages:',
    languageOptions,
    labelVisibility = 'srOnly',
    separator,
  } = options

  return {
    type: 'inlineSentence',
    name: path,
    label,
    hint,
    ...(labelVisibility === 'srOnly' ? { labelVisibility: 'srOnly' } : {}),
    segments: [{ kind: 'text', value: introText, tone: 'label' }],
    below: {
      kind: 'chips',
      name: path,
      options: languageOptions,
    },
    ...(separator ? { separator } : {}),
  }
}
