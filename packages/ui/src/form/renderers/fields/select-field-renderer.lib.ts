import type { FieldOption, SelectFieldConfig } from '../../field-config'
import type { FieldValidationProps } from '../../../components/ui/field-validation-props'

export function soleSelectOptionValue(options: readonly FieldOption[]): string | undefined {
  return options.length === 1 ? options[0]?.value : undefined
}

export function normalizedSelectFieldValue(value: unknown): string {
  return value != null && value !== '' ? String(value) : ''
}

export type SelectFieldChromeProps = Pick<
  SelectFieldConfig,
  | 'label'
  | 'hint'
  | 'hintPosition'
  | 'info'
  | 'required'
  | 'width'
  | 'size'
  | 'digits'
  | 'labelPosition'
>

export function pickSelectFieldChromeProps(config: SelectFieldConfig): SelectFieldChromeProps {
  return {
    label: config.label,
    hint: config.hint,
    hintPosition: config.hintPosition,
    info: config.info,
    required: config.required,
    width: config.width,
    size: config.size,
    digits: config.digits,
    labelPosition: config.labelPosition,
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
