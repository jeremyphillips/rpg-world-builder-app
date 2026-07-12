'use client'

import * as React from 'react'

import type { FieldOption } from '../../form/field-config'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import { ChipsFieldOptions } from './chips-field.client'
import type { CompactLabelSize } from './compact-label.lib'
import { fieldInlineSentenceClasses, type FieldHintPosition } from './field.variants'
import { NumberInput } from './number-input.client'
import { Text } from './text'
import { parseChooseCount } from './choose-count-field.lib'
import { ChooseCountFieldShell } from './choose-count-field-shell.client'

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
  hintPosition?: FieldHintPosition
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  size?: FieldSize
  chipSize?: CompactLabelSize
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
  hintPosition,
  info,
  required,
  disabled,
  size = 'md',
  chipSize,
  width,
}: ChooseFromChipsFieldProps) {
  const resolvedChipSize = chipSize ?? size
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
    >
      {({ legendId, chooseId }) => (
        <>
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
              value={chooseValue ?? ''}
              onChange={(event) => onChooseChange?.(parseChooseCount(event.target.value))}
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
            chipSize={resolvedChipSize}
          />
        </>
      )}
    </ChooseCountFieldShell>
  )
}
