import type { FieldSize } from './field.client'

export interface ComboboxFieldOption {
  label: string
  value: string
  disabled?: boolean
  /** Secondary line text (e.g. source badge copy). Included in search matching. */
  description?: string
}

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
}
