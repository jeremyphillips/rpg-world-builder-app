import type { FieldOption, SelectFieldConfig } from '../../../field-config'
import type { FieldShellProps } from '../../field-shell-props.lib'
import type { FieldValidationProps } from '../../../../components/ui/field-validation-props'

export function soleSelectOptionValue(options: readonly FieldOption[]): string | undefined {
  return options.length === 1 ? options[0]?.value : undefined
}

export function normalizedSelectFieldValue(value: unknown): string {
  return value != null && value !== '' ? String(value) : ''
}

/** Shell props plus select sizing extras. Built beside `buildFieldShellProps`, not by a second picker. */
export type SelectFieldChromeProps = FieldShellProps & {
  digits?: SelectFieldConfig['digits']
  sizingLabel?: SelectFieldConfig['sizingLabel']
  sizingLabels?: SelectFieldConfig['sizingLabels']
  labelPosition?: SelectFieldConfig['labelPosition']
}

export type SelectFieldPresentationProps = SelectFieldChromeProps &
  FieldValidationProps & {
    id: string
    displayValue: string
  }

export type SelectFieldEditableProps = SelectFieldChromeProps &
  FieldValidationProps & {
    id: string
    options: FieldOption[]
    placeholder?: string
    name?: string
    disabled?: boolean
    value: string
    onValueChange: (value: string) => void
    onBlur?: () => void
  }
