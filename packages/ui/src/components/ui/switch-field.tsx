import type { ComponentProps, ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldLabelContent } from './field-label-content'
import { FormField } from './form-field'
import { Switch } from './switch.client'
import {
  fieldLabelHintStackClasses,
  type FieldHintPosition,
  type FieldLabelPosition,
} from './field.variants'
import type { FieldWidth } from './field-control.variants'

export type SwitchLabelPosition = FieldLabelPosition | 'inline'

export interface SwitchFieldProps extends Omit<ComponentProps<typeof Switch>, 'id'> {
  id: string
  label: string
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
  size?: FieldSize
  /**
   * `inline` (default) — switch left, label right.
   * `above` — label over the switch.
   * `settings` — label + hint left, switch right (dense settings panels).
   */
  labelPosition?: SwitchLabelPosition
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
  size = 'md',
  labelPosition = 'inline',
  ...switchProps
}: SwitchFieldProps) {
  const resolvedHintPosition = hintPosition ?? 'below-label'

  const labelNode = (
    <Field.Label className={labelPosition === 'inline' ? 'font-normal' : undefined}>
      <FieldLabelContent label={label} info={info} />
    </Field.Label>
  )

  if (labelPosition === 'settings') {
    return (
      <FormField
        id={id}
        label={label}
        error={error}
        hint={hint}
        hintPosition={hintPosition}
        info={info}
        required={required}
        width={width}
        size={size}
        labelPosition="settings"
      >
        <Switch {...switchProps} />
      </FormField>
    )
  }

  if (labelPosition === 'above') {
    return (
      <Field.Root id={id} error={error} hint={hint} required={required} width={width} size={size}>
        <FieldLayout
          hintPosition={resolvedHintPosition}
          label={labelNode}
          control={<Switch {...switchProps} />}
        />
      </Field.Root>
    )
  }

  return (
    <Field.Root id={id} error={error} hint={hint} required={required} width={width} size={size}>
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
