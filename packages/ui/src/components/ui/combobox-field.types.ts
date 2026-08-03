import type { ReactNode } from 'react'

import type { FieldSize } from './field.client'

export interface ComboboxFieldOption {
  label: string
  value: string
  disabled?: boolean
  /** Secondary line text (e.g. source badge copy). Included in combobox search matching. */
  description?: string
  /** Additional searchable strings (aliases, semantic terms). Matched as keywords in combobox search. */
  searchTerms?: readonly string[]
}

export interface ComboboxSelectedItemRenderContext {
  onRemove: () => void
  disabled?: boolean
  size: FieldSize
}

/** Custom renderer for a selected value in multi-select mode (replaces the default badge). */
export type ComboboxRenderSelectedItem = (
  option: ComboboxFieldOption,
  context: ComboboxSelectedItemRenderContext,
) => ReactNode

/** Optional combobox panel resolver; defaults to {@link filterOptions} order when omitted. */
export type ResolveComboboxFilteredOptions = (
  options: ComboboxFieldOption[],
  query: string,
  selected: string[],
) => ComboboxFieldOption[]

export interface ComboboxFieldControlProps {
  label: string
  options: ComboboxFieldOption[]
  multiple: boolean
  max?: number
  selected: string[]
  onChange?: (value: string | string[]) => void
  onBlur?: () => void
  disabled?: boolean
  loading?: boolean
  size: FieldSize
  placeholder: string
  emptyMessage: string
  /** When false, the panel omits the search row and keyboard nav targets the listbox. */
  enableSearch?: boolean
  renderSelectedItem?: ComboboxRenderSelectedItem
  /** Custom filter/rank for panel options; selected values must remain visible when set. */
  resolveFilteredOptions?: ResolveComboboxFilteredOptions
}
