import type { FieldOption, SelectFieldOptionListItem } from '../../form/field-config'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'
import type { FieldDigits } from './field-digit-metrics'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import type {
  JoinedPairEndOccupantConfig,
  JoinedPairStartOccupantConfig,
} from './joined-pair-field.types'
import type { TypedSelectOption } from './select-option-value.lib'

export type InlineSentenceSegmentVisibility = {
  dependsOn: string[]
  visibleWhen: (watched: Record<string, unknown>) => boolean
}

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
  /** When omitted, the segment always renders. Same contract as `FieldVisibility`. */
  visibility?: InlineSentenceSegmentVisibility
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
  /** Visible label above the select; defaults to sr-only via `ariaLabel`. */
  label?: string
  labelVisibility?: FieldLabelVisibility
  /** sr-only label override when it differs from the field legend. */
  ariaLabel?: string
  /** When omitted, the segment always renders. Same contract as `FieldVisibility`. */
  visibility?: InlineSentenceSegmentVisibility
}

export type InlineSentenceJoinedPairSegment = {
  kind: 'joinedPair'
  /** Accessible name for the joined control group (e.g. `Speed`). */
  ariaLabel: string
  /** Visible label above the joined control; defaults to sr-only via `ariaLabel`. */
  label?: string
  labelVisibility?: FieldLabelVisibility
  start: JoinedPairStartOccupantConfig
  end: JoinedPairEndOccupantConfig
  /** When omitted, the segment always renders. Same contract as `FieldVisibility`. */
  visibility?: InlineSentenceSegmentVisibility
}

export type InlineSentenceSegment =
  | InlineSentenceTextSegment
  | InlineSentenceNumberSegment
  | InlineSentenceSelectSegment
  | InlineSentenceJoinedPairSegment

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
  ariaLabel?: string
  hasError?: boolean
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
  hasError?: boolean
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

export type InlineSentenceBoundJoinedPairSelect = Omit<
  InlineSentenceBoundSelect,
  'onChange' | 'value' | 'options'
> & {
  position: 'start' | 'end'
  value?: string | number
  options: readonly TypedSelectOption[]
  onChange?: (value: string | number | undefined) => void
}

export type InlineSentenceBoundJoinedPairLabelEnd = {
  kind: 'label'
  text: string
  ariaLabel: string
}

export type InlineSentenceBoundJoinedPair = {
  kind: 'joinedPair'
  segmentKey: string
  ariaLabel: string
  start: InlineSentenceBoundNumber | InlineSentenceBoundJoinedPairSelect
  end: InlineSentenceBoundJoinedPairSelect | InlineSentenceBoundJoinedPairLabelEnd
  hasError?: boolean
  describedBy?: string
}

export type InlineSentenceBoundControl =
  | InlineSentenceBoundNumber
  | InlineSentenceBoundSelect
  | InlineSentenceBoundChips
  | InlineSentenceBoundJoinedPair
