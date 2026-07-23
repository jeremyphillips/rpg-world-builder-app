import type { FieldHintPosition } from '../../../components/ui/field.variants'
import type { FieldOption, SelectFieldConfig } from '../../field-config'
import type { FieldValidationProps } from '../../../components/ui/field-validation-props'

export function soleSelectOptionValue(options: readonly FieldOption[]): string | undefined {
  return options.length === 1 ? options[0]?.value : undefined
}

export function normalizedSelectFieldValue(value: unknown): string {
  return value != null && value !== '' ? String(value) : ''
}

export type SelectFieldChromeProps = {
  label: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: SelectFieldConfig['info']
  required?: boolean
  width?: SelectFieldConfig['width']
  size?: SelectFieldConfig['size']
  digits?: SelectFieldConfig['digits']
  labelPosition?: SelectFieldConfig['labelPosition']
  chrome?: SelectFieldConfig['chrome']
}

export function pickSelectFieldChromeProps(
  config: SelectFieldConfig,
  presentation?: Pick<SelectFieldChromeProps, 'hint' | 'hintPosition'>,
): SelectFieldChromeProps {
  return {
    label: config.label,
    hint: presentation?.hint,
    hintPosition: presentation?.hintPosition,
    info: config.info,
    required: config.required,
    width: config.width,
    size: config.size,
    digits: config.digits,
    labelPosition: config.labelPosition,
    chrome: config.chrome,
  }
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
