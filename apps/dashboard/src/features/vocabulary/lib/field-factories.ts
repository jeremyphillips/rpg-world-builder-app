import { nounFromTerm, vocabularyTermFieldCopy, type VocabularyTerm } from '@rpg/contracts'
import type { ComboboxFieldConfig, FieldOption, SelectFieldConfig } from '@rpg/ui/form'

type VocabularyMemberFieldBase = Pick<
  SelectFieldConfig,
  'name' | 'label' | 'required' | 'hint' | 'width' | 'disabled' | 'labelVisibility' | 'separator'
> & {
  options: FieldOption[]
}

/** Single-select field backed by resolved vocabulary options. */
export function vocabularySelectField(
  config: VocabularyMemberFieldBase & {
    placeholder?: string
    defaultValue?: string
    noun?: SelectFieldConfig['noun']
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
    enableSearch?: boolean
    noun?: ComboboxFieldConfig['noun']
  },
): ComboboxFieldConfig {
  return {
    type: 'combobox',
    ...config,
  }
}

type VocabularySelectFieldForTermConfig = Omit<VocabularyMemberFieldBase, 'label'> & {
  placeholder?: string
  defaultValue?: string
  label?: string
}

/** Select field with default label and placeholder from a taxonomy term. */
export function vocabularySelectFieldForTerm(
  term: VocabularyTerm,
  config: VocabularySelectFieldForTermConfig,
): SelectFieldConfig {
  const copy = vocabularyTermFieldCopy(term)
  return vocabularySelectField({
    ...config,
    label: config.label ?? copy.label,
    placeholder: config.placeholder,
    noun: nounFromTerm(term),
  })
}

type VocabularyComboboxFieldForTermConfig = Omit<VocabularyMemberFieldBase, 'label'> & {
  multiple?: boolean
  max?: number
  placeholder?: string
  defaultValue?: string | string[]
  enableSearch?: boolean
  label?: string
}

/** Combobox field with default label and placeholder from a taxonomy term. */
export function vocabularyComboboxFieldForTerm(
  term: VocabularyTerm,
  config: VocabularyComboboxFieldForTermConfig,
): ComboboxFieldConfig {
  const copy = vocabularyTermFieldCopy(term, { multiple: config.multiple })
  return vocabularyComboboxField({
    ...config,
    label: config.label ?? copy.label,
    placeholder: config.placeholder,
    noun: nounFromTerm(term),
  })
}
