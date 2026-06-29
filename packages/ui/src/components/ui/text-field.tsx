import * as React from 'react'

import { FormField } from './form-field'
import { Input } from './input.client'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'

export interface TextFieldProps extends Omit<React.ComponentProps<typeof Input>, 'id'> {
  id: string
  label: string
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: React.ReactNode
  required?: boolean
  width?: FieldWidth
  size?: FieldSize
}

/**
 * A labelled text input: the `FormField` shim bound to an `Input`. The compound
 * `Field` injects `id`, `aria-describedby`, and `aria-invalid` into the input,
 * and the ref forwards through so `react-hook-form`'s `register` works when
 * spread onto it.
 */
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { id, label, error, hint, hintPosition, info, required, width, size = 'md', ...inputProps },
    ref,
  ) => {
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
      >
        <Input ref={ref} size={size} {...inputProps} />
      </FormField>
    )
  },
)
TextField.displayName = 'TextField'
