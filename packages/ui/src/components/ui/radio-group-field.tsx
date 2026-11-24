import { RadioGroupFieldOptions } from './radio-group-field-options.client'
import { RadioFieldShell, type BaseRadioFieldProps } from './radio-field-shell'

export interface RadioGroupFieldOption {
  label: string
  value: string
  disabled?: boolean
}

export interface RadioGroupFieldProps extends BaseRadioFieldProps {
  options: RadioGroupFieldOption[]
  name?: string
  disabled?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Forwarded to the group root so RHF's `field.onBlur` (touched state) can fire. */
  onBlur?: () => void
  orientation?: 'horizontal' | 'vertical'
}

/**
 * A labelled radio group. The group is labelled via `aria-labelledby` (a
 * radiogroup is not a labelable element), and each option has its own `<label>`.
 */
export function RadioGroupField({
  id,
  label,
  options,
  error,
  hint,
  hintPosition,
  info,
  required,
  size,
  width,
  name,
  disabled,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  orientation = 'vertical',
  labelVisibility,
  chrome,
}: RadioGroupFieldProps) {
  return (
    <RadioFieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      hintPosition={hintPosition}
      info={info}
      required={required}
      size={size}
      width={width}
      labelVisibility={labelVisibility}
      chrome={chrome}
    >
      {(labelId) => (
        <RadioGroupFieldOptions
          id={id}
          labelId={labelId}
          options={options}
          name={name}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          onBlur={onBlur}
          orientation={orientation}
        />
      )}
    </RadioFieldShell>
  )
}
