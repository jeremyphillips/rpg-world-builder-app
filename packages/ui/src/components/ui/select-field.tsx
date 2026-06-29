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
import type { FieldHintPosition, FieldLabelPosition } from './field.variants'
import type { FieldDigits } from './field-digit-metrics'
import {
  isFieldOptionGroup,
  type FieldOption,
  type SelectFieldOptionListItem,
} from '../../form/field-config'

export type SelectFieldOption = FieldOption

export interface SelectFieldProps {
  id: string
  label: string
  options: SelectFieldOptionListItem[]
  error?: string
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
  /** `above` (default) — label over control. `settings` — label + hint left, control right. */
  labelPosition?: FieldLabelPosition
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
  const select = (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      disabled={disabled}
    >
      {labelPosition === 'settings' ? (
        <SelectTrigger id={id} size={size} digits={digits} onBlur={onBlur}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      ) : (
        <Field.Control>
          <SelectTrigger size={size} digits={digits} onBlur={onBlur}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </Field.Control>
      )}
      {renderSelectContent(options)}
    </Select>
  )

  if (labelPosition === 'settings') {
    return (
      <FormField
        id={id}
        label={label}
        error={error}
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
        control={select}
      />
    </Field.Root>
  )
}
