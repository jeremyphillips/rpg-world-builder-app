import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Field } from './field.client'
import { fieldLabelVariants } from './field.variants'
import { textVariants } from './text.variants'
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
  orientation?: 'horizontal' | 'vertical'
  labelHidden?: boolean
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
  orientation = 'vertical',
  labelHidden,
}: RadioGroupFieldProps) {
  const labelId = `${id}-label`
  return (
    <Field.Root id={id} error={error} hint={hint} required={required} width={width}>
      <span
        id={labelId}
        className={cn(fieldLabelVariants({ size: 'md' }), labelHidden && 'sr-only')}
      >
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
      </Field.Control>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  )
}
