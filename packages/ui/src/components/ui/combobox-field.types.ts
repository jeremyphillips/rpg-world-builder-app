import type { ReactNode } from 'react'

import type { FieldSize } from './field.client'

export interface ComboboxFieldOption {
  label: string
  value: string
  disabled?: boolean
  /** Secondary line text (e.g. source badge copy). Included in combobox search matching. */
  description?: string
}

export interface ComboboxSelectedItemRenderContext {
  onRemove: () => void
  disabled?: boolean
}

/** Custom renderer for a selected value in multi-select mode (replaces the default chip). */
export type ComboboxRenderSelectedItem = (
  option: ComboboxFieldOption,
  context: ComboboxSelectedItemRenderContext,
) => ReactNode

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
  renderSelectedItem?: ComboboxRenderSelectedItem
}
