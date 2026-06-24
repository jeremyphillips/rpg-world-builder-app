import type { ReactNode } from 'react'

import { Field, type FieldSize } from './field.client'
import { InfoTooltip } from './tooltip.client'
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
  info?: ReactNode
  required?: boolean
  width?: FieldWidth
  size?: FieldSize
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

/** Labelled Radix Select bound to the compound `Field`. */
export function SelectField({
  id,
  label,
  options,
  error,
  hint,
  info,
  required,
  width,
  size = 'md',
  placeholder,
  name,
  disabled,
  value,
  defaultValue,
  onValueChange,
  onBlur,
}: SelectFieldProps) {
  return (
    <Field.Root id={id} error={error} hint={hint} required={required} width={width} size={size}>
      <Field.Label>
        {label}
        {info ? <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip> : null}
      </Field.Label>
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        name={name}
        disabled={disabled}
      >
        <Field.Control>
          <SelectTrigger size={size} onBlur={onBlur}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
        </Field.Control>
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
      </Select>
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  )
}
