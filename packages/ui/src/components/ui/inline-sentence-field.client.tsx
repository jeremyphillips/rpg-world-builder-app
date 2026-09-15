'use client'

import * as React from 'react'
import { useMemo } from 'react'

import { isFieldOptionGroup, type FieldOption } from '../../form/field-config'
import { ChipsFieldOptions } from './chips-field.client'
import type { FieldLabelVisibility } from '../../form/form-heading.lib'
import type { CompactLabelSize } from './compact-label.lib'
import { cn } from '../../lib/utils'
import { ChooseCountFieldShell } from './choose-count-field-shell.client'
import { FieldLabelContent } from './field-label-content'
import { fieldLabelVariants } from './field.variants'
import { parseChooseCount } from './choose-count-field.lib'
import type { FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'
import type { FieldChrome } from './field-chrome.variants'
import { fieldInlineSentenceClasses } from './field.variants'
import { JoinedPair } from './joined-pair-field.client'
import {
  indexInlineSentenceControls,
  inlineSentenceJoinedPairSegmentKey,
  inlineSentenceSelectTriggerWidthClasses,
  isInlineSentenceBoundSegment,
  isInlineSentenceJoinedPairSegment,
} from './inline-sentence-field.lib'
import type {
  InlineSentenceBelowChips,
  InlineSentenceBoundChips,
  InlineSentenceBoundControl,
  InlineSentenceBoundJoinedPair,
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
  /** Field config name — used to resolve joined-pair segment keys. Defaults to `id`. */
  fieldName?: string
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
  chrome?: FieldChrome
  labelVisibility?: FieldLabelVisibility
  chipSize?: CompactLabelSize
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

function InlineSentenceStackedSegment({
  label,
  labelVisibility = 'srOnly',
  size,
  controlId,
  children,
}: {
  label: string
  labelVisibility?: FieldLabelVisibility
  size: FieldSize
  /** When set, associates a visible/sr-only label with the segment control. */
  controlId?: string
  children: React.ReactNode
}) {
  const labelClassName = cn(fieldLabelVariants({ size }), labelVisibility === 'srOnly' && 'sr-only')
  const labelContent = <FieldLabelContent label={label} />

  return (
    <div className={cn('flex w-fit flex-col gap-1.5')}>
      {controlId ? (
        <label htmlFor={controlId} className={labelClassName}>
          {labelContent}
        </label>
      ) : (
        <span className={labelClassName}>{labelContent}</span>
      )}
      {children}
    </div>
  )
}

function InlineSentenceJoinedPairControl({
  control,
  label,
  labelVisibility = 'srOnly',
  size,
  disabled,
}: {
  control: InlineSentenceBoundJoinedPair
  label?: string
  labelVisibility?: FieldLabelVisibility
  size: FieldSize
  disabled?: boolean
}) {
  const { start, end } = control
  const startHasError = control.hasError
  const endHasError = control.hasError
  const resolvedLabel = label ?? control.ariaLabel

  return (
    <InlineSentenceStackedSegment
      label={resolvedLabel}
      labelVisibility={labelVisibility}
      size={size}
    >
      <JoinedPair.Root
        layout="intrinsic"
        invalid={control.hasError}
        disabled={disabled}
        aria-label={control.ariaLabel}
      >
        {start.kind === 'number' ? (
          <JoinedPair.NumberOccupant
            id={start.id}
            ariaLabel={start.ariaLabel ?? start.name}
            value={start.value}
            size={size}
            disabled={disabled}
            min={start.min}
            max={start.max}
            digits={start.digits}
            hasError={startHasError}
            describedBy={control.describedBy}
            onValueChange={(next) => start.onChange?.(next)}
            onBlur={start.onBlur}
          />
        ) : (
          <JoinedPair.SelectOccupant
            id={start.id}
            ariaLabel={start.ariaLabel ?? start.name}
            value={start.value}
            options={start.options}
            size={size}
            position="start"
            disabled={disabled}
            digits={start.digits}
            placeholder={start.placeholder}
            hasError={startHasError}
            describedBy={control.describedBy}
            onValueChange={(next) => start.onChange?.(next)}
            onBlur={start.onBlur}
          />
        )}

        <JoinedPair.Divider />

        {end.kind === 'label' ? (
          <JoinedPair.LabelOccupant text={end.text} ariaLabel={end.ariaLabel} size={size} />
        ) : (
          <JoinedPair.SelectOccupant
            id={end.id}
            ariaLabel={end.ariaLabel ?? end.name}
            value={end.value}
            options={end.options}
            size={size}
            position="end"
            disabled={disabled}
            digits={end.digits}
            placeholder={end.placeholder}
            hasError={endHasError}
            describedBy={control.describedBy}
            onValueChange={(next) => end.onChange?.(next)}
            onBlur={end.onBlur}
          />
        )}
      </JoinedPair.Root>
    </InlineSentenceStackedSegment>
  )
}

function InlineSentenceSelectControl({
  control,
  label,
  labelVisibility = 'srOnly',
  error,
  size,
  disabled,
}: {
  control: InlineSentenceBoundSelect
  label?: string
  labelVisibility?: FieldLabelVisibility
  error?: string
  size: FieldSize
  disabled?: boolean
}) {
  const optionNodes = useMemo(() => renderSelectContent(control.options), [control.options])
  const triggerWidthClassName =
    control.digits == null ? inlineSentenceSelectTriggerWidthClasses(control.width) : undefined
  const resolvedLabel = label ?? control.ariaLabel ?? 'Field'

  const selectControl = (
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
  )

  if (labelVisibility === 'visible' || label != null) {
    return (
      <InlineSentenceStackedSegment
        label={resolvedLabel}
        labelVisibility={labelVisibility}
        size={size}
        controlId={control.id}
      >
        {selectControl}
      </InlineSentenceStackedSegment>
    )
  }

  return (
    <>
      <label htmlFor={control.id} className="sr-only">
        {control.ariaLabel}
      </label>
      {selectControl}
    </>
  )
}

function renderInlineSentenceBoundControl(options: {
  segment: InlineSentenceSegment
  fieldLabel: string
  error?: string
  size: FieldSize
  disabled?: boolean
  control: InlineSentenceBoundControl
}): React.ReactNode {
  const { segment, fieldLabel, error, size, disabled, control } = options

  if (control.kind === 'number') {
    const numberSegment = segment.kind === 'number' ? segment : undefined
    return (
      <InlineSentenceNumberControl
        control={control}
        label={fieldLabel}
        error={error}
        size={size}
        disabled={disabled}
        ariaLabel={numberSegment?.ariaLabel}
      />
    )
  }

  if (control.kind === 'select') {
    const selectSegment = segment.kind === 'select' ? segment : undefined
    return (
      <InlineSentenceSelectControl
        control={control}
        label={selectSegment?.label}
        labelVisibility={selectSegment?.labelVisibility}
        error={error}
        size={size}
        disabled={disabled}
      />
    )
  }

  return null
}

function renderInlineSentenceSegment(options: {
  segment: InlineSentenceSegment
  index: number
  fieldName: string
  fieldLabel: string
  error?: string
  size: FieldSize
  disabled?: boolean
  controlByName: ReturnType<typeof indexInlineSentenceControls>
}): React.ReactNode {
  const { segment, index, fieldName, fieldLabel, error, size, disabled, controlByName } = options

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

  if (isInlineSentenceJoinedPairSegment(segment)) {
    const segmentKey = inlineSentenceJoinedPairSegmentKey(fieldName, index)
    const joinedControl = controlByName.get(segmentKey)
    if (!joinedControl || joinedControl.kind !== 'joinedPair') return null
    return (
      <InlineSentenceJoinedPairControl
        key={segmentKey}
        control={joinedControl}
        label={segment.label}
        labelVisibility={segment.labelVisibility}
        size={size}
        disabled={disabled}
      />
    )
  }

  if (!isInlineSentenceBoundSegment(segment)) return null

  const control = controlByName.get(segment.name)
  if (!control) return null

  const boundControl = renderInlineSentenceBoundControl({
    segment,
    fieldLabel,
    error,
    size,
    disabled,
    control,
  })
  if (!boundControl) return null

  return <React.Fragment key={segment.name}>{boundControl}</React.Fragment>
}

/** Composable inline prose + bound controls (number, select) with optional chips below. */
export function InlineSentenceField({
  id,
  label,
  fieldName: fieldNameProp,
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
  chrome,
  labelVisibility = 'visible',
  chipSize,
}: InlineSentenceFieldProps) {
  const fieldName = fieldNameProp ?? id
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
      chrome={chrome}
      labelVisibility={labelVisibility}
    >
      {({ legendId }) => (
        <>
          <InlineSentenceRow className={fieldInlineSentenceClasses}>
            {segments.map((segment, index) =>
              renderInlineSentenceSegment({
                segment,
                index,
                fieldName,
                fieldLabel: label,
                error,
                size,
                disabled,
                controlByName,
              }),
            )}
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
