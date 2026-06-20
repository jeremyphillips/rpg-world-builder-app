'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { Field } from './field.client'
import { fieldLabelVariants } from './field.variants'
import { Text } from './text'
import { InfoTooltip } from './tooltip.client'
import type { FieldOption } from '../../form/field-config'
import type { FieldWidth } from './field-control.variants'

export interface ChipsFieldProps {
  id: string
  label: string
  options: FieldOption[]
  /**
   * `true` (default) — value is `string[]`; multiple pills may be active.
   * `false` — value is `string`; selecting one deselects the others.
   */
  multiple?: boolean
  /** Maximum selections when `multiple` is true. */
  max?: number
  value?: string | number | Array<string | number>
  onChange?: (value: string | string[]) => void
  onBlur?: () => void
  error?: string
  hint?: string
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  width?: FieldWidth
}

/**
 * Pill-shaped toggle-button group. Renders as a `<fieldset>` with a `<legend>`
 * so screen readers announce the group label before each option.
 */
export function ChipsField({
  id,
  label,
  options,
  multiple = true,
  max,
  value,
  onChange,
  onBlur,
  error,
  hint,
  info,
  required,
  disabled,
  width,
}: ChipsFieldProps) {
  const legendId = `${id}-legend`
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = error ? errorId : hint ? hintId : undefined

  const selected: string[] = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value.map(String) : []
    }
    return value != null && value !== '' ? [String(value)] : []
  }, [multiple, value])

  function toggle(optionValue: string) {
    if (disabled) return
    if (multiple) {
      const next = selected.includes(optionValue)
        ? selected.filter((v) => v !== optionValue)
        : max !== undefined && selected.length >= max
          ? selected
          : [...selected, optionValue]
      onChange?.(next)
    } else {
      const next = selected[0] === optionValue ? '' : optionValue
      onChange?.(next)
    }
  }

  return (
    <fieldset
      id={id}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
      disabled={disabled}
      className={cn('space-y-2', width === 'auto' ? 'w-auto' : 'w-full')}
      onBlur={onBlur}
    >
      <legend id={legendId} className={fieldLabelVariants({ size: 'md' })}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : null}
        {info ? <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip> : null}
      </legend>

      <div className="flex flex-wrap gap-2" role="group" aria-labelledby={legendId}>
        {options.map((option) => {
          const isActive = selected.includes(option.value)
          const atMax = max !== undefined && selected.length >= max
          const optionId = `${id}-${option.value}`
          return (
            <button
              key={option.value}
              id={optionId}
              type="button"
              role={multiple ? 'checkbox' : 'radio'}
              aria-checked={isActive}
              aria-disabled={option.disabled || disabled || (atMax && !isActive) || undefined}
              disabled={option.disabled || disabled || (atMax && !isActive)}
              onClick={() => toggle(option.value)}
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-50',
                isActive
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-transparent text-foreground hover:bg-muted',
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      {error ? (
        <Text id={errorId} variant="destructive" role="alert" aria-live="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text id={hintId} variant="small">
          {hint}
        </Text>
      ) : null}
    </fieldset>
  )
}

/** Thin wrapper that wires `ChipsField` into the `Field.*` compound context.
 *  Use directly when you need the full label/hint/error compound layout. */
export function ChipsFormField(props: ChipsFieldProps) {
  return (
    <Field.Root
      id={props.id}
      error={props.error}
      hint={props.hint}
      required={props.required}
      width={props.width}
    >
      <ChipsField {...props} />
    </Field.Root>
  )
}
