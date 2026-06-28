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
import { FieldLabelContent } from './field-label-content'
import type { FieldOption } from '../../form/field-config'
import type { FieldWidth } from './field-control.variants'
import type { SelectFieldValueProps } from './select-field-value-props'
import { chipPillVariants, type ChipSize } from './chips-field.variants'

interface ChipOptionButtonProps {
  id: string
  option: FieldOption
  role: 'checkbox' | 'radio'
  isActive: boolean
  isDisabled: boolean
  chipSize: ChipSize
  onToggle: (value: string) => void
}

function ChipOptionButton({
  id,
  option,
  role,
  isActive,
  isDisabled,
  chipSize,
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
        chipPillVariants({ size: chipSize }),
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

export interface ChipsFieldOptionsProps {
  id: string
  options: FieldOption[]
  /** Associates the chip group with an external legend or label id. */
  labelledBy: string
  multiple?: boolean
  max?: number
  value?: string | number | Array<string | number>
  onChange?: (value: string | string[]) => void
  onBlur?: () => void
  disabled?: boolean
  chipSize?: ChipSize
}

/** Chip pill row only — for embedding inside a parent fieldset (e.g. `ChooseFromChipsField`). */
export function ChipsFieldOptions({
  id,
  options,
  labelledBy,
  multiple = true,
  max,
  value,
  onChange,
  onBlur,
  disabled,
  chipSize = 'sm',
}: ChipsFieldOptionsProps) {
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
    <div
      className={cn('flex flex-wrap', fieldChipWrapGapClasses)}
      role="group"
      aria-labelledby={labelledBy}
      onBlur={onBlur}
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
            chipSize={chipSize}
            onToggle={toggle}
          />
        )
      })}
    </div>
  )
}

export interface ChipsFieldProps extends SelectFieldValueProps {
  id: string
  label: string
  options: FieldOption[]
  /** Label type scale — matches other field wrappers (default `md`). */
  size?: FieldSize
  /** Pill padding/type scale (default `sm`). */
  chipSize?: ChipSize
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
  size = 'md',
  chipSize = 'sm',
  width,
}: ChipsFieldProps) {
  const legendId = `${id}-legend`
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = error ? errorId : hint ? hintId : undefined

  return (
    <fieldset
      id={id}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
      disabled={disabled}
      className={cn(fieldAnatomyStackClasses, width === 'auto' ? 'w-auto' : 'w-full')}
      onBlur={onBlur}
    >
      <legend
        id={legendId}
        data-required={required || undefined}
        className={fieldLabelVariants({ size })}
      >
        <FieldLabelContent label={label} info={info} />
      </legend>

      <ChipsFieldOptions
        id={id}
        options={options}
        labelledBy={legendId}
        multiple={multiple}
        max={max}
        value={value}
        onChange={onChange}
        disabled={disabled}
        chipSize={chipSize}
      />

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
