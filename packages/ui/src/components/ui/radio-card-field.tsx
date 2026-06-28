import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Field } from './field.client'
import { fieldLabelVariants } from './field.variants'
import { RadioCard, type RadioCardOption } from './radio-card.client'
import { InfoTooltip } from './tooltip.client'
import type { FieldWidth } from './field-control.variants'

export interface RadioCardFieldProps {
  id: string
  label: string
  options: RadioCardOption[]
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
  labelHidden?: boolean
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
      </Field.Control>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  )
}
