import type { ComponentProps, ReactNode } from 'react'

import { Field } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldLabelContent } from './field-label-content'
import { Switch } from './switch.client'
import { fieldLabelHintStackClasses } from './field.variants'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'

export interface SwitchFieldProps extends Omit<ComponentProps<typeof Switch>, 'id'> {
  id: string
  label: string
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
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
  hintPosition,
  info,
  required,
  width,
  labelPosition = 'inline',
  ...switchProps
}: SwitchFieldProps) {
  const resolvedHintPosition = hintPosition ?? 'below-label'

  const labelNode = (
    <Field.Label className={labelPosition === 'inline' ? 'font-normal' : undefined}>
      <FieldLabelContent label={label} info={info} />
    </Field.Label>
  )

  if (labelPosition === 'above') {
    return (
      <Field.Root id={id} error={error} hint={hint} required={required} width={width}>
        <FieldLayout
          hintPosition={resolvedHintPosition}
          label={labelNode}
          control={<Switch {...switchProps} />}
        />
      </Field.Root>
    )
  }

  return (
    <Field.Root id={id} error={error} hint={hint} required={required} width={width}>
      <div className="flex items-start gap-2">
        <Field.Control>
          <Switch {...switchProps} />
        </Field.Control>
        <div className={fieldLabelHintStackClasses}>
          {labelNode}
          <Field.Hint />
        </div>
      </div>
      <Field.Error />
    </Field.Root>
  )
}
