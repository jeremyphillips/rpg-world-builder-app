import type { ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import { FieldLabelContent } from './field-label-content'
import { FormField } from './form-field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
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
import { resolveSelectPlaceholder } from '../../form/config/field-placeholder.lib'

export type SelectFieldOption = FieldOption

import type { FieldValidationProps } from './field-validation-props'

export type SelectLabelPosition = FieldLabelPosition | 'inline'

export interface SelectFieldProps extends FieldValidationProps {
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
  /**
   * `above` (default) — label over control.
   * `inline` — label left, compact control right (`items-center`).
   * `settings` — label + hint left, control right (dense settings panels).
   */
  labelPosition?: SelectLabelPosition
  placeholder?: string
  name?: string
  disabled?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Forwarded to the trigger so RHF's `field.onBlur` (touched state) can fire. */
  onBlur?: () => void
}

function renderSelectOption(option: FieldOption) {
  return (
    <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
      {option.label}
    </SelectItem>
  )
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
  labelPosition,
  placeholder,
  name,
  disabled,
  value,
  defaultValue,
  onValueChange,
  onBlur,
}: SelectFieldProps) {
  const resolvedPlaceholder = resolveSelectPlaceholder(label, placeholder)
  const resolvedHintPosition = hintPosition ?? 'below-label'

  const selectTrigger =
    labelPosition === 'settings' ? (
      <SelectTrigger id={id} size={size} digits={digits} onBlur={onBlur}>
        <SelectValue placeholder={resolvedPlaceholder} />
      </SelectTrigger>
    ) : (
      <Field.Control>
        <SelectTrigger size={size} digits={digits} onBlur={onBlur}>
          <SelectValue placeholder={resolvedPlaceholder} />
        </SelectTrigger>
      </Field.Control>
    )

  const select = (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      disabled={disabled}
    >
      {selectTrigger}
      {renderSelectContent(options)}
    </Select>
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
        width={width}
        size={size}
        labelPosition="settings"
      >
        {select}
      </FormField>
    )
  }

  if (labelPosition === 'inline') {
    return (
      <Field.Root
        id={id}
        error={error}
        invalid={invalid}
        describedBy={describedBy}
        hint={hint}
        required={required}
        width={width}
        size={size}
      >
        <div className={fieldInlineControlRowClasses}>
          {resolvedHintPosition === 'below-label' ? (
            <div className={fieldLabelHintStackClasses}>
              <Field.Label>
                <FieldLabelContent label={label} info={info} />
              </Field.Label>
              <Field.Hint />
            </div>
          ) : (
            <Field.Label>
              <FieldLabelContent label={label} info={info} />
            </Field.Label>
          )}
          {select}
        </div>
        {resolvedHintPosition === 'below-control' ? <Field.Hint /> : null}
        <Field.Error />
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
      width={width}
      size={size}
    >
      <FieldLayout
        hintPosition={hintPosition}
        wrapControl={false}
        label={
          <Field.Label>
            <FieldLabelContent label={label} info={info} />
          </Field.Label>
        }
        control={select}
      />
    </Field.Root>
  )
}
