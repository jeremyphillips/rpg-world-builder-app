import type React from 'react'

/** Shared value/validation props for multi-select field controls. */
export interface SelectFieldValueProps {
  /**
   * `true` (default) — value is `string[]`; multiple selections are allowed.
   * `false` — value is `string`; one selection at a time.
   */
  multiple?: boolean
  /** Maximum selections when `multiple` is true. */
  max?: number
  value?: string | number | Array<string | number>
  onChange?: (value: string | string[]) => void
  onBlur?: () => void
  error?: string
  hint?: string
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
}
