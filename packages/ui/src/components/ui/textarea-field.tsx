import * as React from 'react'

import { FormField } from './form-field'
import { Textarea } from './textarea.client'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'

export interface TextareaFieldProps extends React.ComponentProps<typeof Textarea> {
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

/** Labelled multi-line text input bound to the compound `Field`. */
export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    { id, label, error, hint, hintPosition, info, required, width, size = 'md', ...textareaProps },
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
        <Textarea ref={ref} size={size} {...textareaProps} />
      </FormField>
    )
  },
)
TextareaField.displayName = 'TextareaField'
