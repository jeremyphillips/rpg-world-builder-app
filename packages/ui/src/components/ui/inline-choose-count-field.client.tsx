'use client'

import * as React from 'react'
import { useMemo } from 'react'

import type { FieldOption } from '../../form/field-config'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'
import type { FieldDigits } from './field-digit-metrics'
import { fieldInlineSentenceClasses } from './field.variants'
import { NumberInput } from './number-input.client'
import { InlineSentenceConnector } from './inline-sentence-row'
import { parseChooseCount } from './choose-count-field.lib'
import { ChooseCountFieldShell } from './choose-count-field-shell.client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'

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
  selectId?: string
  selectLabel?: string
  selectValue?: string
  selectOptions?: FieldOption[]
  onSelectChange?: (value: string) => void
  onSelectBlur?: () => void
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
  selectId,
  selectLabel,
  selectValue,
  selectOptions,
  onSelectChange,
  onSelectBlur,
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
  const selectOptionNodes = useMemo(
    () =>
      selectOptions?.map((option) => (
        <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </SelectItem>
      )),
    [selectOptions],
  )

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
          {prefix ? (
            <InlineSentenceConnector size={size} tone="label">
              {prefix}
            </InlineSentenceConnector>
          ) : null}
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
          {suffix ? (
            <InlineSentenceConnector size={size} tone="label">
              {suffix}
            </InlineSentenceConnector>
          ) : null}
          {selectOptions?.length && selectId ? (
            <>
              <label htmlFor={selectId} className="sr-only">
                {selectLabel ?? label}
              </label>
              <Select value={selectValue} onValueChange={onSelectChange} disabled={disabled}>
                <SelectTrigger
                  id={selectId}
                  size={size}
                  aria-invalid={error ? true : undefined}
                  onBlur={onSelectBlur}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>{selectOptionNodes}</SelectContent>
              </Select>
            </>
          ) : null}
        </div>
      )}
    </ChooseCountFieldShell>
  )
}
