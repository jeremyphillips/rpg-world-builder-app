import type { ComponentProps, ReactNode } from 'react'

import { Field } from './field.client'
import { Checkbox } from './checkbox.client'
import { InfoTooltip } from './tooltip.client'
import type { FieldWidth } from './field-control.variants'

export interface CheckboxFieldProps extends Omit<ComponentProps<typeof Checkbox>, 'id'> {
  id: string
  label: string
  error?: string
  hint?: string
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
}

/** A single checkbox with an inline label, bound to the compound `Field`. */
export function CheckboxField({
  id,
  label,
  error,
  hint,
  info,
  required,
  width,
  ...checkboxProps
}: CheckboxFieldProps) {
  return (
    <Field.Root id={id} error={error} hint={hint} required={required} width={width}>
      <div className="flex items-center gap-2">
        <Field.Control>
          <Checkbox {...checkboxProps} />
        </Field.Control>
        <Field.Label className="font-normal">
          {label}
          {info ? <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip> : null}
        </Field.Label>
      </div>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  )
}
