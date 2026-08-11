'use client'

import * as React from 'react'

import { Button } from './button.client'
import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldLabelContent } from './field-label-content'
import { Input } from './input.client'
import { InputActionGroup } from './input-action-group.client'
import { Text } from './text'
import { resolveAttachedButtonSize } from './field-sizing.variants'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'

import type { FieldChrome } from './field-chrome.variants'
import type { TrailingFieldActionConfig } from '../../form/field-config'

export type TextFieldTrailingActionProps = {
  id: string
  label: string
  error?: string
  invalid?: boolean
  describedBy?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: React.ReactNode
  required?: boolean
  width?: FieldWidth
  size?: FieldSize
  chrome?: FieldChrome
  trailingAction: TrailingFieldActionConfig
  disabled?: boolean
  type?: string
  inputProps: Omit<React.ComponentProps<typeof Input>, 'id' | 'size' | 'disabled' | 'type'>
}

function TextFieldTrailingActionError({
  actionErrorId,
  error,
}: {
  actionErrorId: string
  error: string
}) {
  return (
    <Text id={actionErrorId} variant="destructive" role="alert">
      {error}
    </Text>
  )
}

function TextFieldTrailingActionControl({
  id,
  size = 'md',
  inputInvalid,
  disabled,
  fieldDescribedBy,
  required,
  trailingAction,
  actionDisabled,
  actionErrorId,
  type,
  inputProps,
  ref,
}: {
  id: string
  size: FieldSize
  inputInvalid: boolean
  disabled?: boolean
  fieldDescribedBy?: string
  required?: boolean
  trailingAction: TrailingFieldActionConfig
  actionDisabled: boolean
  actionErrorId?: string
  type?: string
  inputProps: TextFieldTrailingActionProps['inputProps']
  ref: React.ForwardedRef<HTMLInputElement>
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <InputActionGroup
        size={size}
        invalid={inputInvalid}
        disabled={Boolean(disabled)}
        aria-labelledby={`${id}-label`}
      >
        <Input
          ref={ref}
          grouped
          id={id}
          size={size}
          type={type}
          disabled={disabled}
          aria-describedby={fieldDescribedBy}
          aria-invalid={inputInvalid || undefined}
          aria-required={required || undefined}
          {...inputProps}
        />
        <InputActionGroup.Action disabled={actionDisabled} aria-describedby={actionErrorId}>
          <Button
            variant="attached"
            size={resolveAttachedButtonSize(size)}
            type="button"
            onClick={() => void trailingAction.onAction()}
          >
            {trailingAction.label}
          </Button>
        </InputActionGroup.Action>
      </InputActionGroup>
      {trailingAction.error && actionErrorId ? (
        <TextFieldTrailingActionError actionErrorId={actionErrorId} error={trailingAction.error} />
      ) : null}
    </div>
  )
}

/** Text field with a joined trailing action — separate from default TextField to keep complexity low. */
export const TextFieldTrailingAction = React.forwardRef<
  HTMLInputElement,
  TextFieldTrailingActionProps
>(
  (
    {
      id,
      label,
      error,
      invalid,
      describedBy: fieldDescribedBy,
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
      inputProps,
    },
    ref,
  ) => {
    const actionErrorId = trailingAction.error ? `${id}-action-error` : undefined
    const actionDisabled = trailingAction.disabled || trailingAction.pending || Boolean(disabled)
    const inputInvalid = invalid ?? Boolean(error)

    return (
      <Field.Root
        id={id}
        error={error}
        invalid={invalid}
        describedBy={fieldDescribedBy}
        hint={hint}
        required={required}
        size={size}
        width={width}
      >
        <FieldLayout
          hintPosition={hintPosition}
          wrapControl={false}
          label={
            <Field.Label id={`${id}-label`} htmlFor={id}>
              <FieldLabelContent label={label} info={info} />
            </Field.Label>
          }
          control={
            <TextFieldTrailingActionControl
              ref={ref}
              id={id}
              size={size}
              inputInvalid={inputInvalid}
              disabled={disabled}
              fieldDescribedBy={fieldDescribedBy}
              required={required}
              trailingAction={trailingAction}
              actionDisabled={actionDisabled}
              actionErrorId={actionErrorId}
              type={type}
              inputProps={inputProps}
            />
          }
          chrome={chrome}
          size={size}
        />
      </Field.Root>
    )
  },
)
TextFieldTrailingAction.displayName = 'TextFieldTrailingAction'
