'use client'

import type { ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import type { FieldDigits } from './field-digit-metrics'
import {
  pickFieldChromeProps,
  resolveFieldAnatomyWidth,
  type FieldChrome,
} from './field-chrome.variants'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'
import { FieldLayout } from './field-layout'
import { JoinedPair } from './joined-pair-field.client'
import { assertAllowedJoinedPairComposition } from './joined-pair-field.lib'
import type {
  JoinedPairEndOccupantConfig,
  JoinedPairStartOccupantConfig,
} from './joined-pair-field.types'
import type { TypedSelectOption } from './select-option-value.lib'
import { FormFieldLabel } from '../../form/presentation/form-field-label.client'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'

export interface JoinedPairFieldFormStartSelectControl {
  kind: 'select'
  id: string
  value: string | number | undefined
  options: readonly TypedSelectOption[]
  digits?: FieldDigits
  sizingLabel?: string
  placeholder?: string
  ariaLabel: string
  hasError?: boolean
  describedBy?: string
  onChange: (value: string | number | undefined) => void
  onBlur?: () => void
}

export interface JoinedPairFieldFormStartNumberControl {
  kind: 'number'
  id: string
  value: number | undefined
  min?: number
  max?: number
  digits?: FieldDigits
  ariaLabel: string
  hasError?: boolean
  describedBy?: string
  onChange: (value: number | undefined) => void
  onBlur?: () => void
}

export interface JoinedPairFieldFormEndSelectControl {
  kind: 'select'
  id: string
  value: string | number | undefined
  options: readonly TypedSelectOption[]
  digits?: FieldDigits
  sizingLabel?: string
  placeholder?: string
  ariaLabel: string
  hasError?: boolean
  describedBy?: string
  onChange: (value: string | number | undefined) => void
  onBlur?: () => void
}

export interface JoinedPairFieldFormProps {
  id: string
  label: string
  labelVisibility?: FieldLabelVisibility
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: ReactNode
  required?: boolean
  disabled?: boolean
  size?: FieldSize
  width?: FieldWidth
  chrome?: FieldChrome
  start: JoinedPairFieldFormStartSelectControl | JoinedPairFieldFormStartNumberControl
  end:
    | JoinedPairFieldFormEndSelectControl
    | {
        kind: 'label'
        text: string
        ariaLabel: string
      }
  startOccupant: JoinedPairStartOccupantConfig
  endOccupant: JoinedPairEndOccupantConfig
}

/** Standalone joined-pair field shell — label, occupants, and shared error slot. */
export function JoinedPairFieldForm({
  id,
  label,
  labelVisibility = 'visible',
  error,
  hint,
  hintPosition,
  info,
  required,
  disabled,
  size = 'md',
  width = 'full',
  chrome,
  start,
  end,
  startOccupant,
  endOccupant,
}: JoinedPairFieldFormProps) {
  assertAllowedJoinedPairComposition({ start: startOccupant, end: endOccupant })
  const labelId = `${id}-label`
  const hasError = Boolean(error)
  const startHasError = start.hasError ?? hasError
  const endHasError = end.kind === 'label' ? hasError : (end.hasError ?? hasError)

  return (
    <Field.Root
      id={id}
      error={error}
      hint={hint}
      required={required}
      width={resolveFieldAnatomyWidth(width, chrome)}
      size={size}
      {...pickFieldChromeProps({ chrome })}
      anatomy
    >
      <FieldLayout
        hintPosition={hintPosition}
        wrapControl={false}
        chrome={chrome}
        size={size}
        label={
          <span id={labelId}>
            <FormFieldLabel
              label={label}
              labelVisibility={labelVisibility}
              required={required}
              info={info}
              className={labelVisibility === 'visible' ? undefined : 'sr-only'}
            />
          </span>
        }
        control={
          <JoinedPair.Root
            layout="intrinsic"
            invalid={hasError}
            disabled={disabled}
            aria-labelledby={labelId}
          >
            {start.kind === 'number' ? (
              <JoinedPair.NumberOccupant
                id={start.id}
                ariaLabel={start.ariaLabel}
                value={start.value}
                size={size}
                disabled={disabled}
                required={required}
                min={start.min}
                max={start.max}
                digits={start.digits}
                hasError={startHasError}
                describedBy={start.describedBy}
                onValueChange={start.onChange}
                onBlur={start.onBlur}
              />
            ) : (
              <JoinedPair.SelectOccupant
                id={start.id}
                ariaLabel={start.ariaLabel}
                value={start.value}
                options={start.options}
                size={size}
                position="start"
                disabled={disabled}
                digits={start.digits}
                sizingLabel={start.sizingLabel}
                placeholder={start.placeholder}
                hasError={startHasError}
                describedBy={start.describedBy}
                onValueChange={start.onChange}
                onBlur={start.onBlur}
              />
            )}

            <JoinedPair.Divider />

            {end.kind === 'label' ? (
              <JoinedPair.LabelOccupant text={end.text} ariaLabel={end.ariaLabel} size={size} />
            ) : (
              <JoinedPair.SelectOccupant
                id={end.id}
                ariaLabel={end.ariaLabel}
                value={end.value}
                options={end.options}
                size={size}
                position="end"
                disabled={disabled}
                digits={end.digits}
                sizingLabel={end.sizingLabel}
                placeholder={end.placeholder}
                hasError={endHasError}
                describedBy={end.describedBy}
                onValueChange={end.onChange}
                onBlur={end.onBlur}
              />
            )}
          </JoinedPair.Root>
        }
      />
    </Field.Root>
  )
}
