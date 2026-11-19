'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { Field, useFieldRootContext, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import { resolveFieldAnatomyWidth, type FieldChrome } from './field-chrome.variants'
import type { FieldHintPosition } from './field.variants'
import type { FieldLabelPresentationProps } from './field-label-props'
import { FormFieldLabel } from '../../form/presentation/form-field-label.client'
import { fieldAnatomyStackClasses } from './field.variants'
import { Input } from './input.client'
import { TextSuggestionsActions } from './text-suggestions-field-parts.client'
import { useTextSuggestionsField } from './text-suggestions-field.use.client'

export interface TextSuggestionsFieldProps extends FieldLabelPresentationProps {
  id: string
  value: string | undefined
  suggestions: readonly string[]
  onValueChange: (value: string | undefined) => void
  placeholder?: string
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  /** Field presentation. Standalone default is `md`. */
  size?: FieldSize
  /** Input geometry. Falls back to `size`. */
  controlSize?: FieldSize
  width?: React.ComponentProps<typeof Field.Root>['width']
  chrome?: FieldChrome
  onBlur?: () => void
  /** Used only when `label` is blank — prefer `label` + `labelVisibility`. */
  ariaLabel?: string
}

function TextSuggestionsInput({
  id,
  size,
  disabled,
  placeholder,
  value,
  ariaLabel,
  onChange,
  onBlur,
}: {
  id: string
  size: React.ComponentProps<typeof Input>['size']
  disabled: boolean
  placeholder?: string
  value: string
  ariaLabel?: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  onBlur?: () => void
}) {
  const { describedBy, hasError } = useFieldRootContext('TextSuggestionsField')
  return (
    <Input
      id={id}
      size={size}
      disabled={disabled}
      placeholder={placeholder}
      value={value}
      aria-label={ariaLabel}
      aria-invalid={hasError || undefined}
      aria-describedby={describedBy}
      onChange={onChange}
      onBlur={onBlur}
    />
  )
}

/** Text input with optional inline advisory suggestions — free entry is always allowed. */
export function TextSuggestionsField({
  id,
  label,
  labelVisibility,
  value,
  suggestions,
  onValueChange,
  placeholder,
  error,
  hint,
  hintPosition = 'below-label',
  info,
  required = false,
  disabled = false,
  size = 'md',
  controlSize,
  width = 'full',
  chrome,
  onBlur,
  ariaLabel,
}: TextSuggestionsFieldProps) {
  const field = useTextSuggestionsField({ value, onValueChange, onBlur })
  const showSuggestions = suggestions.length > 0 && !field.trimmedInput
  const showLabel = Boolean(label.trim())
  const inputAriaLabel = showLabel ? undefined : (ariaLabel ?? (label.trim() ? label : undefined))
  const rootWidth = resolveFieldAnatomyWidth(width, chrome)

  return (
    <Field.Root
      id={id}
      error={error}
      hint={hint}
      hintPosition={hintPosition}
      required={required}
      size={size}
      controlSize={controlSize}
      width={rootWidth}
      labelVisibility={labelVisibility}
      anatomy
    >
      <FieldLayout
        chrome={chrome}
        size={size}
        controlSize={controlSize}
        wrapControl={false}
        label={
          showLabel ? (
            <FormFieldLabel
              id={`${id}-label`}
              htmlFor={id}
              label={label}
              labelVisibility={labelVisibility}
              info={info}
              required={required}
            />
          ) : null
        }
        control={
          <div className={cn(fieldAnatomyStackClasses, 'gap-2')}>
            <Field.Control>
              <TextSuggestionsInput
                id={id}
                size={controlSize ?? size}
                disabled={disabled}
                placeholder={placeholder}
                value={field.displayValue}
                ariaLabel={inputAriaLabel}
                onChange={field.handleInputChange}
                onBlur={field.handleInputBlur}
              />
            </Field.Control>
            {showSuggestions ? (
              <TextSuggestionsActions
                suggestions={suggestions}
                disabled={disabled}
                onSelect={field.handleSuggestionSelect}
              />
            ) : null}
          </div>
        }
      />
    </Field.Root>
  )
}
