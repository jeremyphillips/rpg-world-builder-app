import { RadioCard, type RadioCardOption } from './radio-card.client'
import { RadioFieldShell, type BaseRadioFieldProps } from './radio-field-shell'

export interface RadioCardFieldProps extends BaseRadioFieldProps {
  options: RadioCardOption[]
  name?: string
  disabled?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Forwarded to the group root so RHF's `field.onBlur` (touched state) can fire. */
  onBlur?: () => void
}

/**
 * A labelled card-style radio group. The group is labelled via `aria-labelledby`
 * (a radiogroup is not a labelable element).
 */
export function RadioCardField({
  id,
  label,
  options,
  error,
  hint,
  hintPosition,
  info,
  required,
  width,
  name,
  disabled,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  labelHidden,
}: RadioCardFieldProps) {
  return (
    <RadioFieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      hintPosition={hintPosition}
      info={info}
      required={required}
      width={width}
      labelHidden={labelHidden}
    >
      {(labelId) => (
        <RadioCard
          idPrefix={id}
          aria-labelledby={labelId}
          name={name}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          onBlur={onBlur}
          options={options}
        />
      )}
    </RadioFieldShell>
  )
}
