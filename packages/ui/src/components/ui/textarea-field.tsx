import * as React from 'react'

import { FormField } from './form-field'
import { Textarea } from './textarea.client'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'

import type { FieldChromeProps } from './field-chrome.variants'
import type { FieldValidationProps } from './field-validation-props'
import type { FieldLabelPresentationProps } from './field-label-props'

export interface TextareaFieldProps
  extends
    React.ComponentProps<typeof Textarea>,
    FieldValidationProps,
    FieldChromeProps,
    FieldLabelPresentationProps {
  id: string
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
    {
      id,
      label,
      labelVisibility,
      error,
      invalid,
      describedBy,
      hint,
      hintPosition,
      info,
      required,
      width,
      size = 'md',
      chrome,
      ...textareaProps
    },
    ref,
  ) => {
    return (
      <FormField
        id={id}
        label={label}
        labelVisibility={labelVisibility}
        error={error}
        invalid={invalid}
        describedBy={describedBy}
        hint={hint}
        hintPosition={hintPosition}
        info={info}
        required={required}
        width={width}
        size={size}
        chrome={chrome}
        controlBand="content-sized"
      >
        <Textarea ref={ref} size={size} {...textareaProps} />
      </FormField>
    )
  },
)
TextareaField.displayName = 'TextareaField'
