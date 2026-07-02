'use client'

import { useMemo, type ReactNode } from 'react'

import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'
import type { FieldDigits } from './field-digit-metrics'
import { Field } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldLabelContent } from './field-label-content'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'
import type { FieldOption, SelectFieldOptionListItem } from '../../form/field-config'
import { isFieldOptionGroup } from '../../form/field-config'
import { InlineSentenceConnector, InlineSentenceRow } from './inline-sentence-row'

export interface LevelRangeFieldProps {
  id: string
  label: string
  minId: string
  maxId: string
  minValue?: number
  maxValue?: number
  minOptions: FieldOption[]
  maxOptions: FieldOption[]
  connector?: string
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: ReactNode
  required?: boolean
  disabled?: boolean
  size?: FieldSize
  width?: FieldWidth
  digits?: FieldDigits
  onMinChange?: (value: number) => void
  onMaxChange?: (value: number) => void
  onMinBlur?: () => void
  onMaxBlur?: () => void
}

function renderOptions(options: FieldOption[]) {
  return options.map((option) => (
    <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
      {option.label}
    </SelectItem>
  ))
}

function optionsSignature(options: FieldOption[]): string {
  return JSON.stringify(options.map((option) => [option.value, option.disabled ?? false]))
}

/** Inline min/max level selects joined by a connector (`1 through 20`). */
export function LevelRangeField({
  id,
  label,
  minId,
  maxId,
  minValue,
  maxValue,
  minOptions,
  maxOptions,
  connector = 'through',
  error,
  hint,
  hintPosition,
  info,
  required,
  disabled,
  size = 'md',
  width,
  digits = 2,
  onMinChange,
  onMaxChange,
  onMinBlur,
  onMaxBlur,
}: LevelRangeFieldProps) {
  const minString = minValue !== undefined ? String(minValue) : undefined
  const maxString = maxValue !== undefined ? String(maxValue) : undefined
  const minOptionsKey = optionsSignature(minOptions)
  const maxOptionsKey = optionsSignature(maxOptions)
  const minOptionNodes = useMemo(() => renderOptions(minOptions), [minOptions, minOptionsKey])
  const maxOptionNodes = useMemo(() => renderOptions(maxOptions), [maxOptions, maxOptionsKey])

  return (
    <Field.Root id={id} error={error} hint={hint} required={required} width={width} size={size}>
      <FieldLayout
        hintPosition={hintPosition}
        wrapControl={false}
        label={
          <Field.Label>
            <FieldLabelContent label={label} info={info} />
          </Field.Label>
        }
        control={
          <InlineSentenceRow>
            <label htmlFor={minId} className="sr-only">
              {label} minimum
            </label>
            <Select
              value={minString}
              onValueChange={(next) => onMinChange?.(Number(next))}
              disabled={disabled}
            >
              <Field.Control>
                <SelectTrigger
                  id={minId}
                  size={size}
                  digits={digits}
                  aria-invalid={error ? true : undefined}
                  onBlur={onMinBlur}
                >
                  <SelectValue placeholder="Min" />
                </SelectTrigger>
              </Field.Control>
              <SelectContent>{minOptionNodes}</SelectContent>
            </Select>

            <InlineSentenceConnector size={size}>{connector}</InlineSentenceConnector>

            <label htmlFor={maxId} className="sr-only">
              {label} maximum
            </label>
            <Select
              value={maxString}
              onValueChange={(next) => onMaxChange?.(Number(next))}
              disabled={disabled}
            >
              <Field.Control>
                <SelectTrigger
                  id={maxId}
                  size={size}
                  digits={digits}
                  aria-invalid={error ? true : undefined}
                  onBlur={onMaxBlur}
                >
                  <SelectValue placeholder="Max" />
                </SelectTrigger>
              </Field.Control>
              <SelectContent>{maxOptionNodes}</SelectContent>
            </Select>
          </InlineSentenceRow>
        }
      />
    </Field.Root>
  )
}

/** Flattens grouped select config items to a plain option list. */
export function flattenSelectFieldOptions(options: SelectFieldOptionListItem[]): FieldOption[] {
  return options.flatMap((item) => (isFieldOptionGroup(item) ? item.options : [item]))
}
