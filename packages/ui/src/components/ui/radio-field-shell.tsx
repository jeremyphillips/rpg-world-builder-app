import type { ReactElement, ReactNode } from 'react'

import { Field } from './field.client'
import { FieldRadiogroupLabel } from './field-label-content'
import type { FieldWidth } from './field-control.variants'

export interface BaseRadioFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
  labelHidden?: boolean
}

export interface RadioFieldShellProps extends BaseRadioFieldProps {
  children: (labelId: string) => ReactElement
}

/** Shared `Field.Root` shell for labelled radio groups (`aria-labelledby` pattern). */
export function RadioFieldShell({
  id,
  label,
  error,
  hint,
  info,
  required,
  width,
  labelHidden,
  children,
}: RadioFieldShellProps) {
  const labelId = `${id}-label`

  return (
    <Field.Root id={id} error={error} hint={hint} required={required} width={width}>
      <FieldRadiogroupLabel
        id={labelId}
        label={label}
        required={required}
        info={info}
        labelHidden={labelHidden}
      />
      <Field.Control>{children(labelId)}</Field.Control>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  )
}
