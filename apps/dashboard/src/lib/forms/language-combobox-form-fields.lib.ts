import { LANGUAGE_TERM } from '@rpg/contracts'
import type { FieldOption, FieldVisibility, FormItem } from '@rpg/ui/form'

import { vocabularyComboboxFieldForTerm } from '@/features/vocabulary'

type LanguageComboboxFieldBase = {
  name: string
  label?: string
  hint?: string
  options: FieldOption[]
  required?: boolean
  labelVisibility?: 'visible' | 'srOnly'
  separator?: 'subtle'
  visibility?: FieldVisibility
}

type LanguageMultiComboboxFieldOptions = LanguageComboboxFieldBase & {
  introText?: string
}

function joinHint(introText: string | undefined, hint: string | undefined): string | undefined {
  const parts = [introText, hint].filter((part): part is string => Boolean(part?.trim()))
  return parts.length > 0 ? parts.join(' ') : undefined
}

/** Searchable multi-select language combobox — selected values render as removable chips. */
export function languageMultiComboboxField(options: LanguageMultiComboboxFieldOptions): FormItem {
  const { introText, hint, label, ...rest } = options

  return vocabularyComboboxFieldForTerm(LANGUAGE_TERM, {
    ...rest,
    label,
    multiple: true,
    enableSearch: true,
    hint: joinHint(introText, hint),
  })
}

/** Searchable single-select language combobox for grant rows and similar surfaces. */
export function languageSingleComboboxField(options: LanguageComboboxFieldBase): FormItem {
  return vocabularyComboboxFieldForTerm(LANGUAGE_TERM, {
    ...options,
    multiple: false,
    enableSearch: true,
  })
}
