import { type FieldOption, type FormItem } from '@rpg/ui/form'

export type LanguageGrantItemsFieldOptions = {
  path: string
  label: string
  hint?: string
  introText?: string
  languageOptions: FieldOption[]
  hideLabel?: boolean
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
    hideLabel = true,
    labelVisibility,
    separator,
  } = options

  const resolvedLabelVisibility = labelVisibility ?? (hideLabel ? 'srOnly' : 'visible')

  return {
    type: 'inlineSentence',
    name: path,
    label,
    hint,
    ...(resolvedLabelVisibility === 'srOnly' ? { labelVisibility: 'srOnly' } : {}),
    segments: [{ kind: 'text', value: introText, tone: 'label' }],
    below: {
      kind: 'chips',
      name: path,
      options: languageOptions,
    },
    ...(separator ? { separator } : {}),
  }
}
