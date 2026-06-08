import * as React from 'react'

import { FormField } from './form-field'
import { Input } from './input'

export interface TextFieldProps extends Omit<React.ComponentProps<typeof Input>, 'id'> {
  id: string
  label: string
  error?: string
  hint?: string
}

/**
 * A labelled text input: the `FormField` wrapper bound to an `Input`. Derives
 * `aria-invalid` from `error` and forwards the ref so `react-hook-form`'s
 * `register` (which supplies a ref) works when spread onto it.
 */
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ id, label, error, hint, ...inputProps }, ref) => {
    return (
      <FormField id={id} label={label} error={error} hint={hint}>
        <Input id={id} ref={ref} aria-invalid={Boolean(error) || undefined} {...inputProps} />
      </FormField>
    )
  },
)
TextField.displayName = 'TextField'
