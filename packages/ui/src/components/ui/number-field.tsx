import * as React from 'react'

import { FormField } from './form-field'
import { Input } from './input.client'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'

export interface NumberFieldProps extends Omit<React.ComponentProps<typeof Input>, 'id' | 'type'> {
  id: string
  label: string
  error?: string
  hint?: string
  info?: React.ReactNode
  required?: boolean
  /** Defaults to `xs` — numeric fields are usually only a few characters wide. */
  width?: FieldWidth
  size?: FieldSize
}

/** Labelled numeric input. Defaults to a narrow `xs` width for short numbers. */
export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ id, label, error, hint, info, required, width = 'xs', size = 'md', ...inputProps }, ref) => {
    return (
      <FormField
        id={id}
        label={label}
        error={error}
        hint={hint}
        info={info}
        required={required}
        width={width}
        size={size}
      >
        <Input ref={ref} type="number" inputMode="numeric" size={size} {...inputProps} />
      </FormField>
    )
  },
)
NumberField.displayName = 'NumberField'
