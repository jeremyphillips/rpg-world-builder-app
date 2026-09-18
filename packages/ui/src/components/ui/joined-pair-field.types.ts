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

export type JoinedPairSelectOccupantConfig = {
  kind: 'select'
  name: string
  options: readonly TypedSelectOption[]
  defaultValue?: string | number
  digits?: FieldDigits
  sizingLabel?: string
  sizingLabels?: readonly string[]
  placeholder?: string
  ariaLabel: string
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
