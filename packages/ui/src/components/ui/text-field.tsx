import * as React from 'react'

import { FormField } from './form-field'
import { Input } from './input.client'
import { TextFieldTrailingAction } from './text-field-trailing-action.client'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'

import type { FieldChromeProps } from './field-chrome.variants'
import type { FieldValidationProps } from './field-validation-props'
import type { FieldLabelPresentationProps } from './field-label-props'
import type { TrailingFieldActionConfig } from '../../form/field-config'

export interface TextFieldProps
  extends
    Omit<React.ComponentProps<typeof Input>, 'id'>,
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
  trailingAction?: TrailingFieldActionConfig
}

/**
 * A labelled text input: the `FormField` shim bound to an `Input`. The compound
 * `Field` injects `id`, `aria-describedby`, and `aria-invalid` into the input,
 * and the ref forwards through so `react-hook-form`'s `register` works when
 * spread onto it.
 */
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  if (props.trailingAction) {
    const {
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
      chrome,
      trailingAction,
      disabled,
      type,
      ...inputProps
    } = props

    return (
      <TextFieldTrailingAction
        ref={ref}
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
        chrome={chrome}
        trailingAction={trailingAction}
        disabled={disabled}
        type={type}
        inputProps={inputProps}
      />
    )
  }

  const {
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
    trailingAction: _trailingAction,
    ...inputProps
  } = props

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
    >
      <Input ref={ref} size={size} {...inputProps} />
    </FormField>
  )
})
TextField.displayName = 'TextField'
