'use client'

import * as React from 'react'

import { resolveFieldAnatomyWidth, type FieldChrome } from './field-chrome.variants'
import { FieldAnatomyRowShell } from './field-anatomy-row-shell.client'
import { Field, type FieldSize, useFieldRootContext } from './field.client'
import { useFieldRowParticipation } from './field-row-anatomy.context'
import { FieldLayout } from './field-layout'
import {
  fieldAnatomyStackVariants,
  fieldChipWrapGapClasses,
  fieldLabelVariants,
  type FieldHintPosition,
} from './field.variants'
import { FieldRadiogroupLabel } from './field-label-content'
import type { FieldOption } from '../../form/field-config/field-options'
import type { FieldWidth } from './field-control.variants'
import type { SelectFieldValueProps } from './select-field-value-props'
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
  /** Group role when the parent fieldset/legend is absent (anatomy-row participation). */
  semanticRole?: 'group' | 'radiogroup'
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
  chipSize,
  showSelectedCheckmark = true,
  semanticRole,
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
    <ChipGroup
      className={fieldChipWrapGapClasses}
      onBlur={onBlur}
      semanticRole={semanticRole}
      aria-labelledby={semanticRole ? labelledBy : undefined}
    >
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
  /** Visible lead-in copy — does not replace the field legend / accessible name. */
  introText?: React.ReactNode
  /** Label type scale — matches other field wrappers (default `md`). */
  size?: FieldSize
  controlSize?: FieldSize
  /** Pill padding/type scale — defaults to `size` when omitted. */
  chipSize?: ChipSize
  width?: FieldWidth
  hintPosition?: FieldHintPosition
  chrome?: FieldChrome
  showSelectedCheckmark?: boolean
}

/**
 * Pill-shaped toggle-button group. The visible name is {@link FieldRadiogroupLabel};
 * the group is named with `aria-labelledby`.
 */
function ChipsFieldIntroText({
  introText,
  size,
  hideFromAccessibility,
}: {
  introText: React.ReactNode
  size: FieldSize
  hideFromAccessibility: boolean
}) {
  return (
    <div
      className={fieldLabelVariants({ size })}
      {...(hideFromAccessibility ? { 'aria-hidden': true } : {})}
    >
      {introText}
    </div>
  )
}

export function ChipsField({
  id,
  label,
  labelVisibility = 'visible',
  introText,
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
  controlSize,
  chipSize,
  width,
  chrome,
  showSelectedCheckmark,
}: ChipsFieldProps) {
  const inAnatomyRow = useFieldRowParticipation()
  const resolvedChipSize = chipSize ?? controlSize ?? size
  const resolvedHintPosition = inAnatomyRow ? 'below-control' : hintPosition
  const labelId = `${id}-label`
  const rootWidth = resolveFieldAnatomyWidth(width, chrome)

  const chipsOptions = (labelledBy: string, semanticRole?: 'group' | 'radiogroup') => (
    <ChipsFieldOptions
      id={id}
      options={options}
      labelledBy={labelledBy}
      multiple={multiple}
      max={max}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      chipSize={resolvedChipSize}
      showSelectedCheckmark={showSelectedCheckmark}
      semanticRole={semanticRole}
    />
  )

  const chipsControl = (labelledBy: string, semanticRole?: 'group' | 'radiogroup') =>
    introText != null && introText !== '' ? (
      <div className={fieldAnatomyStackVariants({ size })}>
        <ChipsFieldIntroText
          introText={introText}
          size={size}
          hideFromAccessibility={labelVisibility === 'srOnly'}
        />
        {chipsOptions(labelledBy, semanticRole)}
      </div>
    ) : (
      chipsOptions(labelledBy, semanticRole)
    )

  if (inAnatomyRow) {
    return (
      <FieldAnatomyRowShell
        id={id}
        label={label}
        labelVisibility={labelVisibility}
        error={error}
        invalid={invalid}
        describedBy={describedBy}
        hint={hint}
        hintPosition={resolvedHintPosition}
        info={info}
        required={required}
        size={size}
        width={width}
        chrome={chrome}
        controlBand="content-sized"
      >
        {({ labelId: rowLabelId }) => chipsControl(rowLabelId ?? labelId)}
      </FieldAnatomyRowShell>
    )
  }

  return (
    <Field.Root
      id={id}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
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
        wrapControl={false}
        chrome={chrome}
        size={size}
        controlSize={controlSize}
        controlBand="content-sized"
        label={
          <FieldRadiogroupLabel
            id={labelId}
            label={label}
            required={required}
            info={info}
            size={size}
          />
        }
        control={
          <ChipsFieldGroup labelId={labelId} multiple={multiple}>
            {chipsControl(labelId)}
          </ChipsFieldGroup>
        }
      />
    </Field.Root>
  )
}

function ChipsFieldGroup({
  labelId,
  multiple,
  children,
}: {
  labelId: string
  multiple: boolean
  children: React.ReactNode
}) {
  const { describedBy, hasError } = useFieldRootContext('ChipsField')
  return (
    <div
      role={multiple ? 'group' : 'radiogroup'}
      aria-labelledby={labelId}
      aria-describedby={describedBy}
      aria-invalid={hasError || undefined}
    >
      {children}
    </div>
  )
}

/** Thin wrapper that wires `ChipsField` into the `Field.*` compound context.
 *  Use directly when you need the full label/hint/error compound layout. */
export function ChipsFormField(props: ChipsFieldProps) {
  return <ChipsField {...props} />
}

export type { ChipSize } from './chip.lib'
