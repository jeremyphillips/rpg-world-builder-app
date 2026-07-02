'use client'

import * as React from 'react'

import { FormField } from './form-field'
import { FileDropzone, type FileDropzoneProps } from './file-dropzone.client'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'

import type { FieldValidationProps } from './field-validation-props'

export interface FileFieldProps extends FileDropzoneProps, FieldValidationProps {
  id: string
  label: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: React.ReactNode
  required?: boolean
  width?: FieldWidth
  size?: FieldSize
}

/**
 * A labelled file drop zone: `FormField` shim bound to a `FileDropzone`.
 * The compound `Field` injects `id`, `aria-describedby`, and `aria-invalid`
 * into the dropzone automatically.
 *
 * Use this for RHF-free forms (plain `useState` or `useForm` + `Controller`).
 * For the schema-driven `<Form>` renderer, use `type: 'file'` in the fields
 * config instead — it renders this component internally.
 */
export function FileField({
  id,
  label,
  error,
  invalid,
  describedBy,
  hint,
  hintPosition,
  info,
  required,
  width,
  size = 'md',
  ...dropzoneProps
}: FileFieldProps) {
  return (
    <FormField
      id={id}
      label={label}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
      hint={hint}
      hintPosition={hintPosition}
      info={info}
      required={required}
      width={width}
      size={size}
    >
      <FileDropzone {...dropzoneProps} />
    </FormField>
  )
}
