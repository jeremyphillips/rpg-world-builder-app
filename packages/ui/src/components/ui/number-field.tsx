import * as React from 'react'

import { cn } from '../../lib/utils'
import { FormField } from './form-field'
import { Input } from './input.client'
import { fieldWidthVariants } from './field-control.variants'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'

export interface NumberFieldProps extends Omit<React.ComponentProps<typeof Input>, 'id' | 'type'> {
  id: string
  label: string
  error?: string
  hint?: string
  info?: React.ReactNode
  required?: boolean
  /** Container layout width. Defaults to `full`. */
  width?: FieldWidth
  size?: FieldSize
  /**
   * Max-width applied directly to the `<input>` element, independent of the
   * container's layout `width`. Use intrinsic tokens (`xs`–`xl`, `auto`).
   */
  inputWidth?: FieldWidth
}

/** Labelled numeric input. Container fills available space by default; use `inputWidth` to cap the input element itself. */
export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      id,
      label,
      error,
      hint,
      info,
      required,
      width = 'full',
      inputWidth,
      size = 'md',
      className,
      ...inputProps
    },
    ref,
  ) => {
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
        <Input
          ref={ref}
          type="number"
          inputMode="numeric"
          size={size}
          className={cn(
            inputWidth ? fieldWidthVariants({ width: inputWidth }) : undefined,
            className,
          )}
          {...inputProps}
        />
      </FormField>
    )
  },
)
NumberField.displayName = 'NumberField'
