'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { Field, type FieldSize } from './field.client'
import {
  fieldAnatomyStackClasses,
  fieldChipWrapGapClasses,
  fieldLabelVariants,
} from './field.variants'
import { Text } from './text'
import { InfoTooltip } from './tooltip.client'
import type { FieldOption } from '../../form/field-config'
import type { FieldWidth } from './field-control.variants'
import { chipPillVariants } from './chips-field.variants'

interface ChipOptionButtonProps {
  id: string
  option: FieldOption
  role: 'checkbox' | 'radio'
  isActive: boolean
  isDisabled: boolean
  size: FieldSize
  onToggle: (value: string) => void
}

function ChipOptionButton({
  id,
  option,
  role,
  isActive,
  isDisabled,
  size,
  onToggle,
}: ChipOptionButtonProps) {
  return (
    <button
      id={id}
      type="button"
      role={role}
      aria-checked={isActive}
      aria-disabled={isDisabled || undefined}
      disabled={isDisabled}
      onClick={() => onToggle(option.value)}
      className={cn(
        chipPillVariants({ size }),
        isActive
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-transparent text-foreground hover:bg-muted',
      )}
    >
      {option.label}
    </button>
  )
}

function nextMultiSelection(
  selected: string[],
  optionValue: string,
  max: number | undefined,
): string[] {
  if (selected.includes(optionValue)) return selected.filter((v) => v !== optionValue)
  if (max !== undefined && selected.length >= max) return selected
  return [...selected, optionValue]
}

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
  size?: FieldSize
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
  size = 'sm',
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
      onChange?.(nextMultiSelection(selected, optionValue, max))
      return
    }
    onChange?.(selected[0] === optionValue ? '' : optionValue)
  }

  const selectionRole = multiple ? 'checkbox' : 'radio'
  const atMax = max !== undefined && selected.length >= max

  return (
    <fieldset
      id={id}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
      disabled={disabled}
      className={cn(fieldAnatomyStackClasses, width === 'auto' ? 'w-auto' : 'w-full')}
      onBlur={onBlur}
    >
      <legend id={legendId} className={fieldLabelVariants({ size })}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : null}
        {info ? <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip> : null}
      </legend>

      <div
        className={cn('flex flex-wrap', fieldChipWrapGapClasses)}
        role="group"
        aria-labelledby={legendId}
      >
        {options.map((option) => {
          const isActive = selected.includes(option.value)
          const isDisabled = Boolean(option.disabled || disabled || (atMax && !isActive))
          return (
            <ChipOptionButton
              key={option.value}
              id={`${id}-${option.value}`}
              option={option}
              role={selectionRole}
              isActive={isActive}
              isDisabled={isDisabled}
              size={size}
              onToggle={toggle}
            />
          )
        })}
      </div>

      {error ? (
        <Text id={errorId} variant="destructive" role="alert" aria-live="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text id={hintId} variant="caption">
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
      size={props.size}
    >
      <ChipsField {...props} />
    </Field.Root>
  )
}
