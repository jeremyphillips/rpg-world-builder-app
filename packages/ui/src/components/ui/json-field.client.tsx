'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldLabelContent } from './field-label-content'
import { Textarea } from './textarea.client'
import { Button } from './button.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'

const INVALID_JSON_MESSAGE = 'Invalid JSON'

import type { FieldValidationProps } from './field-validation-props'

export interface JsonFieldProps extends FieldValidationProps {
  id: string
  label: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: React.ReactNode
  required?: boolean
  width?: FieldWidth
  size?: FieldSize
  placeholder?: string
  disabled?: boolean
  name?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  /** Sample value; when provided, an "Insert example" button is shown. */
  example?: unknown
}

function toJsonString(example: unknown): string {
  return typeof example === 'string' ? example : JSON.stringify(example, null, 2)
}

/**
 * A raw JSON editor: a monospace textarea that validates with `JSON.parse` on
 * blur and surfaces "Invalid JSON" through the standard field error/aria path.
 * Pass `example` to render an "Insert example" button that pretty-prints a
 * sample into the field (replacing its content).
 */
export function JsonField({
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
  placeholder,
  disabled,
  name,
  value,
  defaultValue,
  onChange,
  onBlur,
  example,
}: JsonFieldProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '')
  const [parseError, setParseError] = React.useState<string>()
  const currentValue = isControlled ? value : internalValue

  const setValue = (next: string) => {
    if (!isControlled) setInternalValue(next)
    onChange?.(next)
  }

  const validate = (next: string) => {
    if (!next.trim()) {
      setParseError(undefined)
      return
    }
    try {
      JSON.parse(next)
      setParseError(undefined)
    } catch {
      setParseError(INVALID_JSON_MESSAGE)
    }
  }

  const handleInsertExample = () => {
    const text = toJsonString(example)
    setValue(text)
    setParseError(undefined)
  }

  const displayError = error ?? parseError
  const displayInvalid = invalid ?? Boolean(displayError)

  return (
    <Field.Root
      id={id}
      error={displayError}
      invalid={displayInvalid}
      describedBy={describedBy}
      hint={hint}
      required={required}
      width={width}
      size={size}
    >
      <FieldLayout
        hintPosition={hintPosition}
        label={
          <div className="flex items-center justify-between gap-2">
            <Field.Label>
              <FieldLabelContent label={label} info={info} />
            </Field.Label>
            {example !== undefined ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={disabled}
                onClick={handleInsertExample}
              >
                Insert example
              </Button>
            ) : null}
          </div>
        }
        control={
          <Textarea
            name={name}
            size={size}
            disabled={disabled}
            placeholder={placeholder}
            spellCheck={false}
            className={cn('font-mono')}
            value={currentValue}
            onChange={(event) => setValue(event.target.value)}
            onBlur={() => {
              validate(currentValue)
              onBlur?.()
            }}
          />
        }
      />
    </Field.Root>
  )
}
