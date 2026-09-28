'use client'

import type { ReactElement, ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldLabelContent } from './field-label-content'
import { FormField } from './form-field'
import { FieldChromeShell } from './field-chrome-shell'
import { hasActiveFieldChrome, type FieldChrome } from './field-chrome.variants'
import type { FieldWidth } from './field-control.variants'
import {
  fieldInlineControlRowClasses,
  fieldLabelHintStackClasses,
  type FieldHintPosition,
} from './field.variants'
import type { FieldValidationProps } from './field-validation-props'

export type SelectFieldLayoutSharedProps = FieldValidationProps & {
  id: string
  label: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
  size: FieldSize
  chrome?: FieldChrome
  control: ReactElement | ReactNode
}

export function SelectFieldSettingsLayout({
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
  size,
  chrome,
  control,
}: SelectFieldLayoutSharedProps) {
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
      {control as ReactElement}
    </FormField>
  )
}

export function SelectFieldInlineLayout({
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
  size,
  chrome,
  control,
}: SelectFieldLayoutSharedProps) {
  const resolvedHintPosition = hintPosition ?? 'below-label'
  const inlineBody = (
    <>
      <div className={fieldInlineControlRowClasses}>
        {resolvedHintPosition === 'below-label' ? (
          <div className={fieldLabelHintStackClasses}>
            <Field.Label>
              <FieldLabelContent label={label} required={required} info={info} />
            </Field.Label>
            <Field.Hint />
          </div>
        ) : (
          <Field.Label>
            <FieldLabelContent label={label} required={required} info={info} />
          </Field.Label>
        )}
        {control}
      </div>
      {resolvedHintPosition === 'below-control' ? <Field.Hint /> : null}
    </>
  )

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
      {hasActiveFieldChrome(chrome) ? (
        <FieldChromeShell chrome={chrome} size={size}>
          {inlineBody}
          <Field.Error />
        </FieldChromeShell>
      ) : (
        <>
          {inlineBody}
          <Field.Error />
        </>
      )}
    </Field.Root>
  )
}

export function SelectFieldDefaultLayout({
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
  size,
  chrome,
  control,
}: SelectFieldLayoutSharedProps) {
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
      anatomy
    >
      <FieldLayout
        hintPosition={hintPosition}
        wrapControl={false}
        label={
          <Field.Label>
            <FieldLabelContent label={label} required={required} info={info} />
          </Field.Label>
        }
        control={control}
        chrome={chrome}
        size={size}
      />
    </Field.Root>
  )
}
