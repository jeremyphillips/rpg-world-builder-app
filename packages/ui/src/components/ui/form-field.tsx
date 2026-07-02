import type { ReactElement, ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldLabelContent } from './field-label-content'
import {
  fieldLabelHintStackClasses,
  fieldSettingsRowClasses,
  type FieldHintPosition,
  type FieldLabelPosition,
} from './field.variants'
import type { FieldWidth } from './field-control.variants'

export interface FormFieldProps {
  id: string
  label: string
  error?: string
  invalid?: boolean
  describedBy?: string
  hint?: string
  hintPosition?: FieldHintPosition
  /** Optional info-icon content rendered as an `[i]` tooltip beside the label. */
  info?: ReactNode
  required?: boolean
  size?: FieldSize
  width?: FieldWidth
  /** `above` (default) — label over control. `settings` — label + hint left, control right. */
  labelPosition?: FieldLabelPosition
  children: ReactElement
}

const labelNode = (label: string, info?: ReactNode) => (
  <Field.Label>
    <FieldLabelContent label={label} info={info} />
  </Field.Label>
)

/**
 * Prop-based shim over the compound `Field`: label (+ optional `[i]` info
 * tooltip), a single control, and inline hint/error. Use this (or the typed
 * wrappers built on it) for standard fields; reach for `Field.*` directly when
 * a layout needs custom composition.
 */
export function FormField({
  id,
  label,
  error,
  invalid,
  describedBy,
  hint,
  hintPosition,
  info,
  required,
  size,
  width,
  labelPosition = 'above',
  children,
}: FormFieldProps) {
  if (labelPosition === 'settings') {
    return (
      <Field.Root
        id={id}
        error={error}
        invalid={invalid}
        describedBy={describedBy}
        hint={hint}
        required={required}
        size={size}
        width={width}
      >
        <div className={fieldSettingsRowClasses}>
          <div className={fieldLabelHintStackClasses}>
            {labelNode(label, info)}
            <Field.Hint />
          </div>
          <Field.Control>{children}</Field.Control>
        </div>
        <Field.Error />
      </Field.Root>
    )
  }

  return (
    <Field.Root
      id={id}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
      hint={hint}
      required={required}
      size={size}
      width={width}
    >
      <FieldLayout hintPosition={hintPosition} label={labelNode(label, info)} control={children} />
    </Field.Root>
  )
}
