import type { ComponentProps, ReactNode } from 'react'

import { Field } from './field.client'
import { Switch } from './switch.client'
import { InfoTooltip } from './tooltip.client'
import type { FieldWidth } from './field-control.variants'

export interface SwitchFieldProps extends Omit<ComponentProps<typeof Switch>, 'id'> {
  id: string
  label: string
  error?: string
  hint?: string
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
}

/** A labelled toggle switch bound to the compound `Field`. */
export function SwitchField({
  id,
  label,
  error,
  hint,
  info,
  required,
  width,
  ...switchProps
}: SwitchFieldProps) {
  return (
    <Field.Root id={id} error={error} hint={hint} required={required} width={width}>
      <div className="flex items-center gap-2">
        <Field.Control>
          <Switch {...switchProps} />
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
