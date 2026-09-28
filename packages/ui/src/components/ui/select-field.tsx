import type { ReactNode } from 'react'
import { X } from 'lucide-react'

import { Button } from './button.client'
import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldLabelContent } from './field-label-content'
import { FormField } from './form-field'
import { FieldChromeShell } from './field-chrome-shell'
import {
  hasActiveFieldChrome,
  resolveFieldAnatomyWidth,
  type FieldChromeProps,
} from './field-chrome.variants'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './select.client'
import type { FieldWidth } from './field-control.variants'
import {
  fieldInlineControlRowClasses,
  fieldLabelHintStackClasses,
  type FieldHintPosition,
  type FieldLabelPosition,
} from './field.variants'
import type { FieldDigits } from './field-digit-metrics'
import {
  isFieldOptionGroup,
  type FieldOption,
  type SelectFieldOptionListItem,
} from '../../form/field-config'
import {
  resolveFieldPlaceholder,
  type FieldPlaceholderPresentation,
} from '../../form/config/field-placeholder.lib'
import type { FieldNoun } from '@rpg/contracts'
import { SelectOptionItem } from './select-option-item.client'

export type SelectFieldOption = FieldOption

import type { FieldValidationProps } from './field-validation-props'

export type SelectLabelPosition = FieldLabelPosition | 'inline'

export interface SelectFieldProps extends FieldValidationProps, FieldChromeProps {
  id: string
  label: string
  options: SelectFieldOptionListItem[]
  hint?: string
  hintPosition?: FieldHintPosition
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
  size?: FieldSize
  /**
   * Visual digit capacity for the trigger (same ch-based tokens as `NumberInput`).
   * Sizes the control only; leave `width` at default `full` so label and hint span
   * the form column unless the field shares a `FieldRow`.
   */
  digits?: FieldDigits
  /** Compact text trigger width from label string (mutually exclusive with `digits` / `sizingLabels`). */
  sizingLabel?: string
  /** Compact text trigger width from overlapping option-label ghosts. */
  sizingLabels?: readonly string[]
  /**
   * `above` (default) — label over control.
   * `inline` — label left, compact control right (`items-center`).
   * `settings` — label + hint left, control right (dense settings panels).
   */
  labelPosition?: SelectLabelPosition
  placeholder?: string
  noun?: FieldNoun
  presentation?: FieldPlaceholderPresentation
  name?: string
  disabled?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Forwarded to the trigger so RHF's `field.onBlur` (touched state) can fire. */
  onBlur?: () => void
  clearable?: boolean
  clearAccessibleName?: string
  onClear?: () => void
}

function renderSelectOption(option: FieldOption) {
  return <SelectOptionItem key={option.value} option={option} />
}

function renderSelectContent(options: SelectFieldOptionListItem[]) {
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

type SelectRootWithClearProps = {
  label: string
  size: FieldSize
  resolvedValue: string | undefined
  defaultValue?: string
  name?: string
  disabled?: boolean
  clearable: boolean
  clearAccessibleName?: string
  onClear?: () => void
  onValueChange?: (value: string) => void
  selectTrigger: React.ReactNode
  options: SelectFieldOptionListItem[]
}

function SelectRootWithClear({
  label,
  size,
  resolvedValue,
  defaultValue,
  name,
  disabled,
  clearable,
  clearAccessibleName,
  onClear,
  onValueChange,
  selectTrigger,
  options,
}: SelectRootWithClearProps) {
  const showClear = clearable && resolvedValue !== undefined && !disabled
  const select = (
    <Select
      value={resolvedValue}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      disabled={disabled}
    >
      {selectTrigger}
      {renderSelectContent(options)}
    </Select>
  )

  if (!showClear) {
    return select
  }

  return (
    <div className="flex w-full items-stretch gap-0">
      {select}
      <Button
        type="button"
        variant="attached"
        size={size === 'sm' || size === 'lg' ? size : 'default'}
        aria-label={clearAccessibleName ?? `Clear ${label}`}
        onClick={() => {
          if (onClear) {
            onClear()
            return
          }
          onValueChange?.('')
        }}
      >
        <X aria-hidden />
      </Button>
    </div>
  )
}

/** Labelled Radix Select bound to the compound `Field`. */
export function SelectField({
  id,
  label,
  options,
  error,
  invalid,
  describedBy,
  hint,
  hintPosition,
  info,
  required,
  width,
  size = 'md',
  digits,
  sizingLabel,
  sizingLabels,
  labelPosition,
  placeholder,
  noun,
  presentation,
  name,
  disabled,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  clearable = false,
  clearAccessibleName,
  onClear,
  chrome,
}: SelectFieldProps) {
  const resolvedPlaceholder = resolveFieldPlaceholder(
    { label, category: 'choice', noun, digits, presentation },
    placeholder,
  )
  const resolvedHintPosition = hintPosition ?? 'below-label'
  const rootWidth = resolveFieldAnatomyWidth(width, chrome)

  const selectTrigger =
    labelPosition === 'settings' ? (
      <SelectTrigger
        id={id}
        size={size}
        digits={digits}
        sizingLabel={sizingLabel}
        sizingLabels={sizingLabels}
        onBlur={onBlur}
      >
        <SelectValue placeholder={resolvedPlaceholder} />
      </SelectTrigger>
    ) : (
      <Field.Control>
        <SelectTrigger
          size={size}
          digits={digits}
          sizingLabel={sizingLabel}
          sizingLabels={sizingLabels}
          onBlur={onBlur}
        >
          <SelectValue placeholder={resolvedPlaceholder} />
        </SelectTrigger>
      </Field.Control>
    )

  const resolvedValue = typeof value === 'string' && value.length > 0 ? value : undefined

  const select = (
    <SelectRootWithClear
      label={label}
      size={size}
      resolvedValue={resolvedValue}
      defaultValue={defaultValue}
      name={name}
      disabled={disabled}
      clearable={clearable}
      clearAccessibleName={clearAccessibleName}
      onClear={onClear}
      onValueChange={onValueChange}
      selectTrigger={selectTrigger}
      options={options}
    />
  )

  if (labelPosition === 'settings') {
    return (
      <FormField
        id={id}
        label={label}
        error={error}
        invalid={invalid}
        describedBy={describedBy}
        hint={hint}
        hintPosition={hintPosition}
        info={info}
        required={required}
        width={rootWidth}
        size={size}
        labelPosition="settings"
        chrome={chrome}
      >
        {select}
      </FormField>
    )
  }

  if (labelPosition === 'inline') {
    const inlineBody = (
      <>
        <div className={fieldInlineControlRowClasses}>
          {resolvedHintPosition === 'below-label' ? (
            <div className={fieldLabelHintStackClasses}>
              <Field.Label>
                <FieldLabelContent label={label} required={required} info={info} />
              </Field.Label>
              <Field.Hint />
            </div>
          ) : (
            <Field.Label>
              <FieldLabelContent label={label} required={required} info={info} />
            </Field.Label>
          )}
          {select}
        </div>
        {resolvedHintPosition === 'below-control' ? <Field.Hint /> : null}
      </>
    )

    return (
      <Field.Root
        id={id}
        error={error}
        invalid={invalid}
        describedBy={describedBy}
        hint={hint}
        required={required}
        width={rootWidth}
        size={size}
      >
        {hasActiveFieldChrome(chrome) ? (
          <FieldChromeShell chrome={chrome} size={size}>
            {inlineBody}
            <Field.Error />
          </FieldChromeShell>
        ) : (
          <>
            {inlineBody}
            <Field.Error />
          </>
        )}
      </Field.Root>
    )
  }

  return (
    <Field.Root
      id={id}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
      hint={hint}
      required={required}
      width={rootWidth}
      size={size}
      anatomy
    >
      <FieldLayout
        hintPosition={hintPosition}
        wrapControl={false}
        label={
          <Field.Label>
            <FieldLabelContent label={label} required={required} info={info} />
          </Field.Label>
        }
        control={select}
        chrome={chrome}
        size={size}
      />
    </Field.Root>
  )
}
