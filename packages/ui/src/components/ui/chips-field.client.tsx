'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import type { FieldChrome } from './field-chrome.variants'
import { FieldChromeShell } from './field-chrome-shell'
import { hasActiveFieldChrome } from './field-chrome.variants'
import {
  Field,
  FieldErrorText,
  FieldHintBelowLabel,
  FieldHintErrorBelowControl,
  type FieldSize,
} from './field.client'
import {
  fieldAnatomyStackClasses,
  fieldChipWrapGapClasses,
  fieldLabelVariants,
  fieldSetResetClasses,
  type FieldHintPosition,
} from './field.variants'
import { FieldLabelContent } from './field-label-content'
import { shouldShowVisibleRequiredMarker } from './field-required.lib'
import type { FieldOption } from '../../form/field-config'
import type { FieldWidth } from './field-control.variants'
import type { SelectFieldValueProps } from './select-field-value-props'
import { fieldHasValidationError, resolveFieldDescribedBy } from './field-validation-props'
import type { FieldLabelPresentationProps } from './field-label-props'
import { Chip, type ChipSize } from './chip.client'
import { ChipGroup } from './chip-group.client'

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
  onChange?: (value: string | string[] | undefined) => void
  onBlur?: () => void
  disabled?: boolean
  chipSize: ChipSize
  /** When false, selected chips omit the leading check icon. Defaults to true. */
  showSelectedCheckmark?: boolean
}

/** Chip pill row only — for embedding inside a parent fieldset (e.g. `ChooseFromChipsField`). */
export function ChipsFieldOptions({
  id,
  options,
  multiple = true,
  max,
  value,
  onChange,
  onBlur,
  disabled,
  chipSize,
  showSelectedCheckmark = true,
}: ChipsFieldOptionsProps) {
  const selected: string[] = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value.map(String) : []
    }
    return value != null && value !== '' ? [String(value)] : []
  }, [multiple, value])

  function handleSelectedChange(optionValue: string, next: boolean) {
    if (disabled) return
    if (multiple) {
      onChange?.(
        next
          ? nextMultiSelection(selected, optionValue, max)
          : selected.filter((value) => value !== optionValue),
      )
      return
    }
    onChange?.(next ? optionValue : undefined)
  }

  const selectionRole = multiple ? 'checkbox' : 'radio'
  const atMax = max !== undefined && selected.length >= max

  return (
    <ChipGroup className={fieldChipWrapGapClasses} onBlur={onBlur}>
      {options.map((option) => {
        const isActive = selected.includes(option.value)
        const isDisabled = Boolean(option.disabled || disabled || (atMax && !isActive))
        return (
          <Chip
            key={option.value}
            id={`${id}-${option.value}`}
            mode="selectable"
            size={chipSize}
            selected={isActive}
            onSelectedChange={(next) => handleSelectedChange(option.value, next)}
            selectionRole={selectionRole}
            disabled={isDisabled}
            leadingIcon={showSelectedCheckmark ? undefined : null}
          >
            {option.label}
          </Chip>
        )
      })}
    </ChipGroup>
  )
}

export interface ChipsFieldProps extends SelectFieldValueProps, FieldLabelPresentationProps {
  id: string
  options: FieldOption[]
  /** Label type scale — matches other field wrappers (default `md`). */
  size?: FieldSize
  /** Pill padding/type scale — defaults to `size` when omitted. */
  chipSize?: ChipSize
  width?: FieldWidth
  hintPosition?: FieldHintPosition
  chrome?: FieldChrome
  showSelectedCheckmark?: boolean
}

/**
 * Pill-shaped toggle-button group. Renders as a `<fieldset>` with a `<legend>`
 * so screen readers announce the group label before each option.
 */
export function ChipsField({
  id,
  label,
  labelVisibility = 'visible',
  options,
  multiple = true,
  max,
  value,
  onChange,
  onBlur,
  error,
  invalid,
  describedBy,
  hint,
  hintPosition = 'below-label',
  info,
  required,
  disabled,
  size = 'md',
  chipSize,
  width,
  chrome,
  showSelectedCheckmark,
}: ChipsFieldProps) {
  const resolvedChipSize = chipSize ?? size
  const legendId = `${id}-legend`
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const hasError = fieldHasValidationError(error, invalid)
  const resolvedDescribedBy = resolveFieldDescribedBy(
    error,
    invalid,
    hint,
    describedBy,
    errorId,
    hintId,
  )

  const chipsOptions = (
    <ChipsFieldOptions
      id={id}
      options={options}
      labelledBy={legendId}
      multiple={multiple}
      max={max}
      value={value}
      onChange={onChange}
      disabled={disabled}
      chipSize={resolvedChipSize}
      showSelectedCheckmark={showSelectedCheckmark}
    />
  )

  return (
    <div className={width === 'auto' ? 'w-auto' : 'w-full'}>
      <fieldset
        id={id}
        aria-describedby={resolvedDescribedBy}
        aria-invalid={hasError || undefined}
        disabled={disabled}
        className={cn(fieldSetResetClasses, fieldAnatomyStackClasses)}
        onBlur={onBlur}
      >
        <legend
          id={legendId}
          className={cn(fieldLabelVariants({ size }), labelVisibility === 'srOnly' && 'sr-only')}
        >
          <FieldLabelContent
            label={label}
            required={required}
            showRequiredMarker={shouldShowVisibleRequiredMarker(required, labelVisibility)}
            info={info}
          />
        </legend>

        {hintPosition === 'below-label' ? (
          <FieldHintBelowLabel hint={hint} error={error} hintId={hintId} />
        ) : null}

        {hasActiveFieldChrome(chrome) ? (
          <FieldChromeShell chrome={chrome} size={size}>
            {chipsOptions}
          </FieldChromeShell>
        ) : (
          chipsOptions
        )}

        {hintPosition === 'below-label' ? (
          error ? (
            <FieldErrorText id={errorId} size={size}>
              {error}
            </FieldErrorText>
          ) : null
        ) : (
          <FieldHintErrorBelowControl
            hint={hint}
            error={error}
            hintId={hintId}
            errorId={errorId}
            size={size}
          />
        )}
      </fieldset>
    </div>
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

export type { CompactLabelSize as ChipSize } from './compact-label.lib'
