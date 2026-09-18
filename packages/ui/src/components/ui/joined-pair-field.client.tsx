'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import { groupedEndLabelSegmentShellClasses } from './select-compact-trigger.variants'
import { SelectLikeValueSlot } from './select-like-trigger-slots.client'
import {
  joinedPairDividerVariants,
  joinedPairGroupVariants,
  joinedPairStartNumberWrapperVariants,
  joinedPairStartTextSegmentVariants,
  type JoinedPairGroupVariantProps,
} from './joined-pair-field.variants'
import type {
  JoinedPairLabelOccupantProps,
  JoinedPairNumberOccupantProps,
  JoinedPairSelectOccupantProps,
} from './joined-pair-field.types'
import { Input } from './input.client'
import { NumberInput } from './number-input.client'
import {
  encodeSelectOptionValue,
  encodeStoredSelectOptionValue,
  resolveSelectOptionChange,
} from './select-option-value.lib'
import { Select, SelectContent, SelectTrigger, SelectValue } from './select.client'
import { SelectOptionItem } from './select-option-item.client'

function parseNumberValue(raw: string): number | undefined {
  if (raw.trim() === '') return undefined
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? undefined : parsed
}

export interface JoinedPairRootProps extends JoinedPairGroupVariantProps {
  /** Accessible name for the group when no visible label is present. */
  'aria-label'?: string
  'aria-labelledby'?: string
  children: React.ReactNode
  className?: string
}

function JoinedPairRoot({
  layout = 'intrinsic',
  invalid = false,
  disabled = false,
  className,
  children,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: JoinedPairRootProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn(joinedPairGroupVariants({ layout, invalid, disabled }), className)}
    >
      {children}
    </div>
  )
}

function JoinedPairDivider() {
  return <div aria-hidden className={joinedPairDividerVariants({ strength: 'primary' })} />
}

export function JoinedPairNumberOccupant({
  id,
  value,
  size,
  disabled,
  placeholder,
  min,
  max,
  step,
  digits,
  formatGrouped,
  required,
  hasError,
  describedBy,
  ariaLabel,
  onValueChange,
  onBlur,
}: JoinedPairNumberOccupantProps) {
  const displayValue = value ?? ''

  return (
    <>
      <label htmlFor={id} className="sr-only">
        {ariaLabel}
      </label>
      <div data-input-select-value className={joinedPairStartNumberWrapperVariants()}>
        <NumberInput
          id={id}
          grouped
          size={size}
          digits={digits}
          formatGrouped={formatGrouped}
          disabled={disabled}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          value={displayValue}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          onChange={(event) => onValueChange(parseNumberValue(event.target.value))}
          onBlur={onBlur}
          className="rounded-l-md rounded-r-none"
        />
      </div>
    </>
  )
}

export function JoinedPairTextStartOccupant({
  id,
  value,
  size,
  disabled,
  placeholder,
  required,
  hasError,
  describedBy,
  ariaLabel,
  onValueChange,
  onBlur,
}: {
  id: string
  value: string | number | undefined
  size: FieldSize
  disabled?: boolean
  placeholder?: string
  required?: boolean
  hasError?: boolean
  describedBy?: string
  ariaLabel: string
  onValueChange: (value: string) => void
  onBlur?: () => void
}) {
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {ariaLabel}
      </label>
      <Input
        id={id}
        data-input-select-value
        type="text"
        size={size}
        disabled={disabled}
        placeholder={placeholder}
        value={value ?? ''}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        onChange={(event) => onValueChange(event.target.value)}
        onBlur={onBlur}
        className={joinedPairStartTextSegmentVariants({ size })}
      />
    </>
  )
}

export function JoinedPairSelectOccupant({
  id,
  value,
  options,
  size,
  position,
  disabled,
  digits,
  sizingLabel,
  sizingLabels,
  placeholder,
  hasError,
  describedBy,
  ariaLabel,
  onValueChange,
  onBlur,
}: JoinedPairSelectOccupantProps) {
  const encodedValue = encodeStoredSelectOptionValue(value, options)

  function handleChange(nextEncoded: string) {
    const resolved = resolveSelectOptionChange(nextEncoded, options)
    onValueChange(resolved)
  }

  return (
    <>
      <label htmlFor={id} className="sr-only">
        {ariaLabel}
      </label>
      <Select value={encodedValue} onValueChange={handleChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          size={size}
          grouped
          groupedPosition={position}
          digits={digits}
          sizingLabel={sizingLabel}
          sizingLabels={sizingLabels}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          onBlur={onBlur}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectOptionItem
              key={encodeSelectOptionValue(option.value)}
              option={{
                label: option.label,
                value: String(option.value),
                disabled: option.disabled,
                disabledReason: option.disabledReason,
              }}
              itemValue={encodeSelectOptionValue(option.value)}
            />
          ))}
        </SelectContent>
      </Select>
    </>
  )
}

export function JoinedPairLabelOccupant({ text, ariaLabel, size }: JoinedPairLabelOccupantProps) {
  return (
    <>
      <span className="sr-only">
        {ariaLabel}: {text}
      </span>
      <span aria-hidden className={groupedEndLabelSegmentShellClasses(size)}>
        <SelectLikeValueSlot size={size} position="end">
          {text}
        </SelectLikeValueSlot>
      </span>
    </>
  )
}

export const JoinedPair = {
  Root: JoinedPairRoot,
  Divider: JoinedPairDivider,
  NumberOccupant: JoinedPairNumberOccupant,
  TextStartOccupant: JoinedPairTextStartOccupant,
  SelectOccupant: JoinedPairSelectOccupant,
  LabelOccupant: JoinedPairLabelOccupant,
}
