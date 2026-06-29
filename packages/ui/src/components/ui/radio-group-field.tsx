import { cn } from '../../lib/utils'
import { textVariants } from './text.variants'
import { RadioGroup, RadioGroupItem } from './radio-group.client'
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
  width,
  name,
  disabled,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  orientation = 'vertical',
  labelHidden,
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
      width={width}
      labelHidden={labelHidden}
    >
      {(labelId) => (
        <RadioGroup
          aria-labelledby={labelId}
          name={name}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          onBlur={onBlur}
          orientation={orientation}
          className={cn(
            orientation === 'horizontal'
              ? 'flex flex-wrap items-center gap-x-6 gap-y-2'
              : 'grid gap-2',
          )}
        >
          {options.map((option) => {
            const optionId = `${id}-${option.value}`
            return (
              <div key={option.value} className="flex items-center gap-2">
                <RadioGroupItem id={optionId} value={option.value} disabled={option.disabled} />
                <label htmlFor={optionId} className={textVariants({ variant: 'option' })}>
                  {option.label}
                </label>
              </div>
            )
          })}
        </RadioGroup>
      )}
    </RadioFieldShell>
  )
}
