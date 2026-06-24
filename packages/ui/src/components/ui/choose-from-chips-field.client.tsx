'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import type { FieldOption } from '../../form/field-config'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import { ChipsFieldOptions } from './chips-field.client'
import type { ChipSize } from './chips-field.variants'
import {
  chooseFromChipsSentenceClasses,
  fieldAnatomyStackClasses,
  fieldLabelVariants,
  fieldSetResetClasses,
} from './field.variants'
import { NumberInput } from './number-input.client'
import { Text } from './text'
import { InfoTooltip } from './tooltip.client'

export interface ChooseFromChipsFieldProps {
  id: string
  label: string
  options: FieldOption[]
  chooseValue?: number
  onChooseChange?: (value: number | undefined) => void
  onChooseBlur?: () => void
  chipsValue?: string[]
  onChipsChange?: (value: string[]) => void
  onChipsBlur?: () => void
  chooseMin?: number
  chooseMax?: number
  /** Leading sentence fragment before the count input. Defaults to `Choose`. */
  prefix?: string
  /** Trailing sentence fragment after the count input. Defaults to `skills from:`. */
  suffix?: string
  error?: string
  hint?: string
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  size?: FieldSize
  chipSize?: ChipSize
  width?: FieldWidth
}

/**
 * “Choose [N] skills from:” composite — one fieldset label, inline count, chip options below.
 */
export function ChooseFromChipsField({
  id,
  label,
  options,
  chooseValue,
  onChooseChange,
  onChooseBlur,
  chipsValue,
  onChipsChange,
  onChipsBlur,
  chooseMin = 0,
  chooseMax,
  prefix = 'Choose',
  suffix = 'skills from:',
  error,
  hint,
  info,
  required,
  disabled,
  size = 'md',
  chipSize = 'sm',
  width,
}: ChooseFromChipsFieldProps) {
  const legendId = `${id}-legend`
  const chooseId = `${id}-choose`
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = error ? errorId : hint ? hintId : undefined

  function parseChoose(raw: string): number | undefined {
    if (raw.trim() === '') return undefined
    const parsed = Number(raw)
    return Number.isNaN(parsed) ? undefined : parsed
  }

  return (
    <fieldset
      id={id}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
      disabled={disabled}
      className={cn(
        fieldSetResetClasses,
        fieldAnatomyStackClasses,
        width === 'auto' ? 'w-auto' : 'w-full',
      )}
    >
      <legend
        id={legendId}
        data-required={required || undefined}
        className={fieldLabelVariants({ size })}
      >
        {label}
        {info ? <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip> : null}
      </legend>

      <div className={chooseFromChipsSentenceClasses}>
        <Text variant="body">{prefix}</Text>
        <label htmlFor={chooseId} className="sr-only">
          {label} count
        </label>
        <NumberInput
          id={chooseId}
          size={size}
          digits={1}
          stepperMin={chooseMin}
          stepperMax={chooseMax}
          min={chooseMin}
          max={chooseMax}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          value={chooseValue ?? ''}
          onChange={(event) => onChooseChange?.(parseChoose(event.target.value))}
          onBlur={onChooseBlur}
        />
        <Text variant="body">{suffix}</Text>
      </div>

      <ChipsFieldOptions
        id={id}
        options={options}
        labelledBy={legendId}
        value={chipsValue}
        onChange={(next) => onChipsChange?.(Array.isArray(next) ? next : next ? [next] : [])}
        onBlur={onChipsBlur}
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
