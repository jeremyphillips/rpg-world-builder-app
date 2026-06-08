import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Field } from './field.client'
import { RadioGroup, RadioGroupItem } from './radio-group.client'
import { InfoTooltip } from './tooltip.client'
import type { FieldWidth } from './field-control.variants'

export interface RadioGroupFieldOption {
  label: string
  value: string
  disabled?: boolean
}

export interface RadioGroupFieldProps {
  id: string
  label: string
  options: RadioGroupFieldOption[]
  error?: string
  hint?: string
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
  name?: string
  disabled?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Forwarded to the group root so RHF's `field.onBlur` (touched state) can fire. */
  onBlur?: () => void
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
  info,
  required,
  width,
  name,
  disabled,
  value,
  defaultValue,
  onValueChange,
  onBlur,
}: RadioGroupFieldProps) {
  const labelId = `${id}-label`
  return (
    <Field.Root id={id} error={error} hint={hint} required={required} width={width}>
      <span id={labelId} className="flex items-center gap-1.5 text-sm font-medium leading-none">
        {label}
        {required ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : null}
        {info ? <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip> : null}
      </span>
      <Field.Control>
        <RadioGroup
          aria-labelledby={labelId}
          name={name}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          onBlur={onBlur}
        >
          {options.map((option) => {
            const optionId = `${id}-${option.value}`
            return (
              <div key={option.value} className="flex items-center gap-2">
                <RadioGroupItem id={optionId} value={option.value} disabled={option.disabled} />
                <label htmlFor={optionId} className={cn('text-sm font-normal leading-none')}>
                  {option.label}
                </label>
              </div>
            )
          })}
        </RadioGroup>
      </Field.Control>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  )
}
