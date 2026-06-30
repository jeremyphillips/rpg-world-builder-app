'use client'

import * as React from 'react'

import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'
import type { FieldDigits } from './field-digit-metrics'
import { fieldInlineSentenceClasses } from './field.variants'
import { NumberInput } from './number-input.client'
import { Text } from './text'
import { parseChooseCount } from './choose-count-field.lib'
import { ChooseCountFieldShell } from './choose-count-field-shell.client'

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
  /** Visual digit capacity for the count input. Defaults to `1`. */
  digits?: FieldDigits
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
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
  digits = 1,
  error,
  hint,
  hintPosition,
  info,
  required,
  disabled,
  size = 'md',
  width,
  hideLabel = false,
}: InlineChooseCountFieldProps) {
  return (
    <ChooseCountFieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      hintPosition={hintPosition}
      info={info}
      required={required}
      disabled={disabled}
      size={size}
      width={width}
      hideLabel={hideLabel}
    >
      {({ chooseId }) => (
        <div className={fieldInlineSentenceClasses}>
          {prefix ? <Text variant="body">{prefix}</Text> : null}
          <label htmlFor={chooseId} className="sr-only">
            {label} count
          </label>
          <NumberInput
            id={chooseId}
            size={size}
            digits={digits}
            stepperMin={chooseMin}
            stepperMax={chooseMax}
            min={chooseMin}
            max={chooseMax}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            value={value ?? ''}
            onChange={(event) => onChange?.(parseChooseCount(event.target.value))}
            onBlur={onBlur}
          />
          <Text variant="body">{suffix}</Text>
        </div>
      )}
    </ChooseCountFieldShell>
  )
}
