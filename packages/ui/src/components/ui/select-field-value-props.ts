import type React from 'react'

import type { FieldValidationProps } from './field-validation-props'

/** Shared value/validation props for multi-select field controls. */
export interface SelectFieldValueProps extends FieldValidationProps {
  /**
   * `true` (default) — value is `string[]`; multiple selections are allowed.
   * `false` — value is `string`; one selection at a time.
   */
  multiple?: boolean
  /** Maximum selections when `multiple` is true. */
  max?: number
  value?: string | number | Array<string | number>
  /** Optional single-select controls may emit `undefined` when cleared. */
  onChange?: (value: string | string[] | undefined) => void
  onBlur?: () => void
  hint?: string
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
}
