import * as React from 'react'

import { cn } from '../../lib/utils'
import { FormField } from './form-field'
import { NumberInput, type NumberInputProps } from './number-input.client'
import { fieldWidthVariants } from './field-control.variants'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition, FieldLabelPosition } from './field.variants'

export interface NumberFieldProps extends Omit<NumberInputProps, 'id'> {
  id: string
  label: string
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: React.ReactNode
  required?: boolean
  /** Container layout width. Defaults to `full`. */
  width?: FieldWidth
  size?: FieldSize
  /** `above` (default) — label over control. `settings` — label + hint left, control right. */
  labelPosition?: FieldLabelPosition
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
      hintPosition,
      info,
      required,
      width = 'full',
      inputWidth,
      size = 'md',
      labelPosition,
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
        hintPosition={hintPosition}
        info={info}
        required={required}
        width={width}
        size={size}
        labelPosition={labelPosition}
      >
        <NumberInput
          ref={ref}
          id={id}
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
