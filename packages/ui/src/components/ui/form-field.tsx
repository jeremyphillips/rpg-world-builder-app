import type { ReactElement, ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldLabelContent } from './field-label-content'
import type { FieldHintPosition } from './field.variants'
import type { FieldWidth } from './field-control.variants'

export interface FormFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  /** Optional info-icon content rendered as an `[i]` tooltip beside the label. */
  info?: ReactNode
  required?: boolean
  size?: FieldSize
  width?: FieldWidth
  children: ReactElement
}

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
  hint,
  hintPosition,
  info,
  required,
  size,
  width,
  children,
}: FormFieldProps) {
  return (
    <Field.Root id={id} error={error} hint={hint} required={required} size={size} width={width}>
      <FieldLayout
        hintPosition={hintPosition}
        label={
          <Field.Label>
            <FieldLabelContent label={label} info={info} />
          </Field.Label>
        }
        control={children}
      />
    </Field.Root>
  )
}
