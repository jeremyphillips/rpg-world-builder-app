'use client'

import type { ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldLabelContent } from './field-label-content'
import { FormField } from './form-field'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition, FieldLabelPosition } from './field.variants'
import type { FieldDigits } from './field-digit-metrics'
import type { FieldChromeProps } from './field-chrome.variants'
import type { FieldValidationProps } from './field-validation-props'
import { fieldReadOnlyValueClassName } from './field-read-only-value.variants'

export interface FieldReadOnlyValueProps {
  id: string
  displayValue: string
  size?: FieldSize
  digits?: FieldDigits
  className?: string
  /** Associates the value with an external label (e.g. array item title). */
  ariaLabelledBy?: string
  ariaDescribedBy?: string
  /** Screen-reader label when no visible `Field.Label` is rendered. */
  ariaLabel?: string
}

/**
 * Compact read-only value segment — use inside custom layouts or `FieldReadOnlyValueField`.
 * When used in a `FieldRow` via `FieldReadOnlyValueField`, the shared control band comes from
 * `FieldLayout` / `FormField` — do not wrap this span in a second band.
 */
export function FieldReadOnlyValue({
  id,
  displayValue,
  size = 'md',
  digits,
  className,
  ariaLabelledBy,
  ariaDescribedBy,
  ariaLabel,
}: FieldReadOnlyValueProps) {
  return (
    <span
      id={id}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabelledBy ? undefined : ariaLabel}
      className={fieldReadOnlyValueClassName({ size, digits, className })}
    >
      {displayValue}
    </span>
  )
}

export interface FieldReadOnlyValueFieldProps extends FieldValidationProps, FieldChromeProps {
  id: string
  label: string
  displayValue: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
  size?: FieldSize
  digits?: FieldDigits
  labelPosition?: FieldLabelPosition
  className?: string
}

/** Labelled read-only field — mirrors `SelectField` anatomy without an editable control. */
export function FieldReadOnlyValueField({
  id,
  label,
  displayValue,
  error,
  invalid,
  describedBy,
  hint,
  hintPosition,
  info,
  required,
  width,
  size = 'md',
  digits,
  labelPosition,
  className,
  chrome,
}: FieldReadOnlyValueFieldProps) {
  const labelId = `${id}-label`
  const valueNode = (
    <FieldReadOnlyValue
      id={id}
      displayValue={displayValue}
      size={size}
      digits={digits}
      className={className}
      ariaLabelledBy={label.trim() ? labelId : undefined}
      ariaLabel={label.trim() ? label : displayValue}
    />
  )

  if (labelPosition === 'settings') {
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
        labelPosition="settings"
        chrome={chrome}
      >
        {valueNode}
      </FormField>
    )
  }

  return (
    <Field.Root
      id={id}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
      hint={hint}
      required={required}
      width={width}
      size={size}
    >
      {label.trim() ? (
        <FieldLayout
          hintPosition={hintPosition}
          wrapControl={false}
          label={
            <Field.Label id={labelId}>
              <FieldLabelContent label={label} info={info} />
            </Field.Label>
          }
          control={<Field.Control>{valueNode}</Field.Control>}
          chrome={chrome}
          size={size}
        />
      ) : (
        valueNode
      )}
      <Field.Error />
    </Field.Root>
  )
}
