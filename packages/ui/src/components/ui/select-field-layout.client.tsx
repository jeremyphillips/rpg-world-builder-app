'use client'

import type { ReactElement, ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
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
import type { FieldLabelVisibility } from '../../form/form-heading.lib'
import { FormFieldLabel } from '../../form/presentation/form-field-label.client'
import { useFieldRootContext } from './field.client'
import { showOwnedLabelSlot, useOwnedLabelVisibility } from './owned-label-visibility.lib'

export type SelectFieldLayoutSharedProps = FieldValidationProps & {
  id: string
  label: string
  labelVisibility?: FieldLabelVisibility
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
  labelVisibility,
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
  labelVisibility,
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
      labelVisibility={labelVisibility}
    >
      {hasActiveFieldChrome(chrome) ? (
        <FieldChromeShell chrome={chrome} size={size}>
          <SelectFieldInlineBody
            label={label}
            info={info}
            required={required}
            hintPosition={hintPosition}
            control={control}
          />
          <Field.Error />
        </FieldChromeShell>
      ) : (
        <>
          <SelectFieldInlineBody
            label={label}
            info={info}
            required={required}
            hintPosition={hintPosition}
            control={control}
          />
          <Field.Error />
        </>
      )}
    </Field.Root>
  )
}

function SelectFieldInlineBody({
  label,
  info,
  required,
  hintPosition,
  control,
}: {
  label: string
  info?: ReactNode
  required?: boolean
  hintPosition?: FieldHintPosition
  control: ReactElement | ReactNode
}) {
  const visibility = useOwnedLabelVisibility()
  const { hasHint } = useFieldRootContext('SelectFieldInlineBody')
  const resolvedHintPosition = hintPosition ?? 'below-label'
  const hintInLabelSlot = hasHint && resolvedHintPosition === 'below-label'
  const showLabelSlot = showOwnedLabelSlot({
    labelVisibility: visibility,
    hintInLabelSlot,
    hasInfo: info != null,
  })
  const ownedLabel = <FormFieldLabel label={label} info={info} required={required} />

  return (
    <>
      {showLabelSlot ? (
        <div className={fieldInlineControlRowClasses}>
          {hintInLabelSlot ? (
            <div className={fieldLabelHintStackClasses}>
              {ownedLabel}
              <Field.Hint />
            </div>
          ) : (
            ownedLabel
          )}
          {control}
        </div>
      ) : (
        <>
          {ownedLabel}
          <div className={fieldInlineControlRowClasses}>{control}</div>
        </>
      )}
      {resolvedHintPosition === 'below-control' ? <Field.Hint /> : null}
    </>
  )
}

export function SelectFieldDefaultLayout({
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
      labelVisibility={labelVisibility}
      anatomy
    >
      <FieldLayout
        hintPosition={hintPosition}
        wrapControl={false}
        label={<FormFieldLabel label={label} required={required} info={info} />}
        control={control}
        chrome={chrome}
        size={size}
      />
    </Field.Root>
  )
}
