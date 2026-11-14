import type { FieldDigits } from './field-digit-metrics'
import type { FieldSize } from './field.client'
import type { TypedSelectOption } from './select-option-value.lib'

export type JoinedPairNumberOccupantConfig = {
  kind: 'number'
  name: string
  min?: number
  max?: number
  step?: number
  digits?: FieldDigits
  defaultValue?: number
  placeholder?: string
  formatGrouped?: boolean
  ariaLabel: string
}

/** Dynamic select options for a joined-pair select occupant. */
export type JoinedPairSelectOptionsResolve = {
  dependsOn: readonly string[]
  optionsWhen: (values: Record<string, unknown>) => readonly TypedSelectOption[]
}

export type JoinedPairSelectOccupantConfig = {
  kind: 'select'
  name: string
  options: readonly TypedSelectOption[]
  /** When set, replaces `options` at render time from watched `dependsOn` values. */
  optionsResolve?: JoinedPairSelectOptionsResolve
  defaultValue?: string | number
  digits?: FieldDigits
  sizingLabel?: string
  sizingLabels?: readonly string[]
  placeholder?: string
  ariaLabel: string
  /**
   * Appends Custom and swaps this occupant to a number input until blur.
   * A stored number that is not in `options` stays selectable.
   */
  allowCustom?: boolean
  /** Prepends an empty choice that writes `undefined`. Does not insert a default. */
  clearable?: boolean
  /** Minimum for a committed custom number. Defaults to 1. */
  customMin?: number
  /** Maximum for a committed custom number. Omitted means no ceiling. */
  customMax?: number
}

export type JoinedPairLabelOccupantConfig = {
  kind: 'label'
  text: string
  ariaLabel: string
}

export type JoinedPairStartOccupantConfig =
  | JoinedPairNumberOccupantConfig
  | JoinedPairSelectOccupantConfig

export type JoinedPairEndOccupantConfig =
  | JoinedPairSelectOccupantConfig
  | JoinedPairLabelOccupantConfig

export type JoinedPairOccupantsConfig = {
  start: JoinedPairStartOccupantConfig
  end: JoinedPairEndOccupantConfig
}

export type JoinedPairNumberOccupantProps = Omit<
  JoinedPairNumberOccupantConfig,
  'kind' | 'name' | 'defaultValue'
> & {
  id: string
  value: number | undefined
  disabled?: boolean
  required?: boolean
  hasError?: boolean
  describedBy?: string
  size: FieldSize
  onValueChange: (value: number | undefined) => void
  onBlur?: () => void
}

export type JoinedPairSelectOccupantProps = Omit<
  JoinedPairSelectOccupantConfig,
  'kind' | 'name' | 'defaultValue'
> & {
  id: string
  value: string | number | undefined
  disabled?: boolean
  hasError?: boolean
  describedBy?: string
  size: FieldSize
  position: 'start' | 'end'
  onValueChange: (value: string | number | undefined) => void
  onBlur?: () => void
}

export type JoinedPairLabelOccupantProps = Omit<JoinedPairLabelOccupantConfig, 'kind'> & {
  size: FieldSize
}
