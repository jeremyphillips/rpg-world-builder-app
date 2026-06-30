import type { ReactElement, ReactNode } from 'react'

import { Field } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldRadiogroupLabel } from './field-label-content'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'

export interface BaseRadioFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: ReactNode
  required?: boolean
  size?: FieldSize
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
  hintPosition,
  info,
  required,
  size,
  width,
  labelHidden,
  children,
}: RadioFieldShellProps) {
  const labelId = `${id}-label`

  return (
    <Field.Root id={id} error={error} hint={hint} required={required} size={size} width={width}>
      <FieldLayout
        hintPosition={hintPosition}
        label={
          <FieldRadiogroupLabel
            id={labelId}
            label={label}
            required={required}
            info={info}
            size={size}
            labelHidden={labelHidden}
          />
        }
        control={children(labelId)}
      />
    </Field.Root>
  )
}
