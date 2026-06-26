'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import {
  fieldAnatomyStackClasses,
  fieldInlineSentenceClasses,
  fieldLabelVariants,
  fieldSetResetClasses,
} from './field.variants'
import { NumberInput } from './number-input.client'
import { Text } from './text'
import { InfoTooltip } from './tooltip.client'

export interface InlineChooseCountFieldProps {
  id: string
  label: string
  value?: number
  onChange?: (value: number | undefined) => void
  onBlur?: () => void
  chooseMin?: number
  chooseMax?: number
  /** Leading sentence fragment before the count input. Defaults to `Choose`. */
  prefix?: string
  /** Trailing sentence fragment after the count input. Defaults to `from:`. */
  suffix?: string
  error?: string
  hint?: string
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  size?: FieldSize
  width?: FieldWidth
  /** When true, the legend is visually hidden but kept for assistive tech. */
  hideLabel?: boolean
}

/**
 * Inline “Choose [N] packages” sentence — count input between prefix/suffix text.
 */
export function InlineChooseCountField({
  id,
  label,
  value,
  onChange,
  onBlur,
  chooseMin = 1,
  chooseMax,
  prefix = 'Choose',
  suffix = 'from:',
  error,
  hint,
  info,
  required,
  disabled,
  size = 'md',
  width,
  hideLabel = false,
}: InlineChooseCountFieldProps) {
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
        className={cn(fieldLabelVariants({ size }), hideLabel && 'sr-only')}
      >
        {label}
        {info ? <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip> : null}
      </legend>

      <div className={fieldInlineSentenceClasses}>
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
          value={value ?? ''}
          onChange={(event) => onChange?.(parseChoose(event.target.value))}
          onBlur={onBlur}
        />
        <Text variant="body">{suffix}</Text>
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
