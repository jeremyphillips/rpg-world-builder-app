import type { ComboboxFieldConfig, FieldOption, SelectFieldConfig } from '@rpg/ui/form'

/** Default combobox placeholder for vocabulary-backed multi-select fields. */
export const VOCABULARY_COMBOBOX_PLACEHOLDER = 'Choose options…'

type VocabularyMemberFieldBase = Pick<
  SelectFieldConfig,
  'name' | 'label' | 'required' | 'hint' | 'width' | 'disabled'
> & {
  options: FieldOption[]
}

/** Single-select field backed by resolved vocabulary options. */
export function vocabularySelectField(
  config: VocabularyMemberFieldBase & {
    placeholder?: string
    defaultValue?: string
  },
): SelectFieldConfig {
  return {
    type: 'select',
    ...config,
  }
}

/** Combobox field backed by resolved vocabulary options (single or multi). */
export function vocabularyComboboxField(
  config: VocabularyMemberFieldBase & {
    multiple?: boolean
    max?: number
    placeholder?: string
    defaultValue?: string | string[]
  },
): ComboboxFieldConfig {
  return {
    type: 'combobox',
    placeholder: config.placeholder ?? VOCABULARY_COMBOBOX_PLACEHOLDER,
    ...config,
  }
}
