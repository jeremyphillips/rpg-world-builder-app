'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { Field, FieldHintText } from './field.client'
import { FieldLayout } from './field-layout'
import type { FieldHintPosition } from './field.variants'
import { FieldLabelContent } from './field-label-content'
import { fieldAnatomyStackClasses } from './field.variants'
import { Input } from './input.client'
import { TextSuggestionsActions } from './text-suggestions-field-parts.client'
import { useTextSuggestionsField } from './text-suggestions-field.use.client'

export interface TextSuggestionsFieldProps {
  id: string
  label: string
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
  size?: React.ComponentProps<typeof Field.Root>['size']
  width?: React.ComponentProps<typeof Field.Root>['width']
  onBlur?: () => void
  /** Used when the visible label is provided by a parent shell (e.g. optional disclosure). */
  ariaLabel?: string
}

/** Text input with optional inline advisory suggestions — free entry is always allowed. */
export function TextSuggestionsField({
  id,
  label,
  value,
  suggestions,
  onValueChange,
  placeholder,
  error,
  hint,
  hintPosition: _hintPosition,
  info,
  required = false,
  disabled = false,
  size = 'md',
  width = 'full',
  onBlur,
  ariaLabel,
}: TextSuggestionsFieldProps) {
  const hintId = `${id}-hint`
  const field = useTextSuggestionsField({ value, onValueChange, onBlur })
  const hasError = Boolean(error)
  const showSuggestions = suggestions.length > 0 && !field.trimmedInput
  const describedBy =
    [hasError ? `${id}-error` : undefined, hint ? hintId : undefined].filter(Boolean).join(' ') ||
    undefined
  const inputAriaLabel = ariaLabel ?? (label.trim() ? label : undefined)
  const showLabel = Boolean(label.trim())

  return (
    <Field.Root id={id} error={error} required={required} size={size} width={width}>
      <FieldLayout
        label={
          showLabel ? (
            <Field.Label id={`${id}-label`} htmlFor={id}>
              <FieldLabelContent label={label} info={info} />
            </Field.Label>
          ) : null
        }
        control={
          <div className={cn(fieldAnatomyStackClasses, 'gap-2')}>
            <Input
              id={id}
              size={size}
              disabled={disabled}
              placeholder={placeholder}
              value={field.displayValue}
              aria-label={inputAriaLabel}
              aria-invalid={hasError || undefined}
              aria-describedby={describedBy}
              onChange={field.handleInputChange}
              onBlur={field.handleInputBlur}
            />
            {hint ? <FieldHintText id={hintId}>{hint}</FieldHintText> : null}
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
