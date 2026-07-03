import type { FieldOption, SelectFieldOptionListItem } from '../../form/field-config'
import type { FieldDigits } from './field-digit-metrics'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'

export type InlineSentenceTextSegment = {
  kind: 'text'
  value: string
  tone?: 'label' | 'prose' | 'mono'
}

export type InlineSentenceNumberSegment = {
  kind: 'number'
  name: string
  min?: number
  max?: number
  digits?: FieldDigits
  defaultValue?: number
  /** sr-only label for the number input. Defaults to `${fieldLabel} count` in the renderer. */
  ariaLabel?: string
}

export type InlineSentenceSelectSegment = {
  kind: 'select'
  name: string
  options: SelectFieldOptionListItem[]
  digits?: FieldDigits
  /**
   * Trigger width when `digits` is omitted. Intrinsic tokens (`xs`–`xl`, `auto`)
   * keep the control on the inline row; defaults to `auto` (`w-fit`).
   */
  width?: FieldWidth
  placeholder?: string
  defaultValue?: string
  /** sr-only label override when it differs from the field legend. */
  ariaLabel?: string
}

export type InlineSentenceSegment =
  | InlineSentenceTextSegment
  | InlineSentenceNumberSegment
  | InlineSentenceSelectSegment

export type InlineSentenceBelowChips = {
  kind: 'chips'
  name: string
  options: FieldOption[]
  multiple?: boolean
  max?: number
  chipSize?: FieldSize
  defaultValue?: string[]
}

export type InlineSentenceBoundNumber = {
  kind: 'number'
  id: string
  name: string
  value?: number
  min?: number
  max?: number
  digits?: FieldDigits
  onChange?: (value: number | undefined) => void
  onBlur?: () => void
}

export type InlineSentenceBoundSelect = {
  kind: 'select'
  id: string
  name: string
  value?: string
  options: SelectFieldOptionListItem[]
  digits?: FieldDigits
  width?: FieldWidth
  placeholder?: string
  ariaLabel?: string
  onChange?: (value: string) => void
  onBlur?: () => void
}

export type InlineSentenceBoundChips = {
  kind: 'chips'
  id: string
  name: string
  value: string[]
  options: FieldOption[]
  multiple?: boolean
  max?: number
  chipSize?: FieldSize
  onChange?: (value: string[]) => void
  onBlur?: () => void
}

export type InlineSentenceBoundControl =
  | InlineSentenceBoundNumber
  | InlineSentenceBoundSelect
  | InlineSentenceBoundChips
