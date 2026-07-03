'use client'

import * as React from 'react'
import { useMemo } from 'react'

import { isFieldOptionGroup, type FieldOption } from '../../form/field-config'
import { ChipsFieldOptions } from './chips-field.client'
import type { ChipSize } from './chips-field.variants'
import { ChooseCountFieldShell } from './choose-count-field-shell.client'
import { parseChooseCount } from './choose-count-field.lib'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'
import { fieldInlineSentenceClasses } from './field.variants'
import {
  indexInlineSentenceControls,
  inlineSentenceSelectTriggerWidthClasses,
} from './inline-sentence-field.lib'
import type {
  InlineSentenceBelowChips,
  InlineSentenceBoundChips,
  InlineSentenceBoundControl,
  InlineSentenceBoundNumber,
  InlineSentenceBoundSelect,
  InlineSentenceSegment,
} from './inline-sentence-field.types'
import { InlineSentenceConnector, InlineSentenceRow } from './inline-sentence-row'
import { NumberInput } from './number-input.client'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './select.client'

export type {
  InlineSentenceBelowChips,
  InlineSentenceBoundControl,
  InlineSentenceNumberSegment,
  InlineSentenceSegment,
  InlineSentenceSelectSegment,
  InlineSentenceTextSegment,
} from './inline-sentence-field.types'

export interface InlineSentenceFieldProps {
  id: string
  label: string
  segments: InlineSentenceSegment[]
  controls: InlineSentenceBoundControl[]
  below?: InlineSentenceBelowChips
  belowControl?: InlineSentenceBoundChips
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  size?: FieldSize
  width?: FieldWidth
  hideLabel?: boolean
  chipSize?: ChipSize
}

function renderSelectOption(option: FieldOption) {
  return (
    <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
      {option.label}
    </SelectItem>
  )
}

function renderSelectContent(options: InlineSentenceBoundSelect['options']) {
  return (
    <SelectContent>
      {options.map((item) => {
        if (isFieldOptionGroup(item)) {
          return (
            <SelectGroup key={item.label}>
              <SelectLabel>{item.label}</SelectLabel>
              {item.options.map((option) => renderSelectOption(option))}
            </SelectGroup>
          )
        }
        return renderSelectOption(item)
      })}
    </SelectContent>
  )
}

function InlineSentenceNumberControl({
  control,
  label,
  error,
  size,
  disabled,
  ariaLabel,
}: {
  control: InlineSentenceBoundNumber
  label: string
  error?: string
  size: FieldSize
  disabled?: boolean
  ariaLabel?: string
}) {
  return (
    <>
      <label htmlFor={control.id} className="sr-only">
        {ariaLabel ?? `${label} count`}
      </label>
      <NumberInput
        id={control.id}
        size={size}
        digits={control.digits ?? 1}
        stepperMin={control.min}
        stepperMax={control.max}
        min={control.min}
        max={control.max}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        value={control.value ?? ''}
        onChange={(event) => control.onChange?.(parseChooseCount(event.target.value))}
        onBlur={control.onBlur}
      />
    </>
  )
}

function InlineSentenceSelectControl({
  control,
  error,
  size,
  disabled,
}: {
  control: InlineSentenceBoundSelect
  error?: string
  size: FieldSize
  disabled?: boolean
}) {
  const optionNodes = useMemo(
    () => renderSelectContent(control.options),
    [control.options],
  )
  const triggerWidthClassName =
    control.digits == null ? inlineSentenceSelectTriggerWidthClasses(control.width) : undefined

  return (
    <>
      <label htmlFor={control.id} className="sr-only">
        {control.ariaLabel}
      </label>
      <Select value={control.value} onValueChange={control.onChange} disabled={disabled}>
        <SelectTrigger
          id={control.id}
          size={size}
          digits={control.digits}
          className={triggerWidthClassName}
          aria-invalid={error ? true : undefined}
          onBlur={control.onBlur}
        >
          <SelectValue placeholder={control.placeholder} />
        </SelectTrigger>
        {optionNodes}
      </Select>
    </>
  )
}

/** Composable inline prose + bound controls (number, select) with optional chips below. */
export function InlineSentenceField({
  id,
  label,
  segments,
  controls,
  below,
  belowControl,
  error,
  hint,
  hintPosition,
  info,
  required,
  disabled,
  size = 'md',
  width,
  hideLabel = false,
  chipSize,
}: InlineSentenceFieldProps) {
  const controlByName = useMemo(() => indexInlineSentenceControls(controls), [controls])
  const resolvedChipSize = chipSize ?? below?.chipSize ?? size

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
      {({ legendId }) => (
        <>
          <InlineSentenceRow className={fieldInlineSentenceClasses}>
            {segments.map((segment, index) => {
              if (segment.kind === 'text') {
                if (!segment.value) return null
                return (
                  <InlineSentenceConnector
                    key={`${segment.value}-${index}`}
                    size={size}
                    tone={segment.tone ?? 'label'}
                  >
                    {segment.value}
                  </InlineSentenceConnector>
                )
              }

              const control = controlByName.get(segment.name)
              if (!control) return null

              if (control.kind === 'number') {
                const numberSegment = segment.kind === 'number' ? segment : undefined
                return (
                  <React.Fragment key={control.id}>
                    <InlineSentenceNumberControl
                      control={control}
                      label={label}
                      error={error}
                      size={size}
                      disabled={disabled}
                      ariaLabel={numberSegment?.ariaLabel}
                    />
                  </React.Fragment>
                )
              }

              if (control.kind === 'select') {
                return (
                  <React.Fragment key={control.id}>
                    <InlineSentenceSelectControl
                      control={control}
                      error={error}
                      size={size}
                      disabled={disabled}
                    />
                  </React.Fragment>
                )
              }

              return null
            })}
          </InlineSentenceRow>

          {below && belowControl ? (
            <ChipsFieldOptions
              id={belowControl.id}
              options={belowControl.options}
              labelledBy={legendId}
              value={belowControl.value}
              onChange={(next) =>
                belowControl.onChange?.(Array.isArray(next) ? next : next ? [next] : [])
              }
              onBlur={belowControl.onBlur}
              disabled={disabled}
              chipSize={resolvedChipSize}
              multiple={belowControl.multiple}
              max={belowControl.max}
            />
          ) : null}
        </>
      )}
    </ChooseCountFieldShell>
  )
}
