import type { ComponentProps, ReactNode } from 'react'

import { Field } from './field.client'
import { FieldLabelContent } from './field-label-content'
import { Switch } from './switch.client'
import type { FieldWidth } from './field-control.variants'

export interface SwitchFieldProps extends Omit<ComponentProps<typeof Switch>, 'id'> {
  id: string
  label: string
  error?: string
  hint?: string
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
  /** `inline` (default) — switch and label on one row. `above` — label over the switch. */
  labelPosition?: 'above' | 'inline'
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
  labelPosition = 'inline',
  ...switchProps
}: SwitchFieldProps) {
  const labelNode = (
    <Field.Label className={labelPosition === 'inline' ? 'font-normal' : undefined}>
      <FieldLabelContent label={label} info={info} />
    </Field.Label>
  )

  return (
    <Field.Root id={id} error={error} hint={hint} required={required} width={width}>
      {labelPosition === 'above' ? (
        <>
          {labelNode}
          <Field.Control>
            <Switch {...switchProps} />
          </Field.Control>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <Field.Control>
            <Switch {...switchProps} />
          </Field.Control>
          {labelNode}
        </div>
      )}
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  )
}
