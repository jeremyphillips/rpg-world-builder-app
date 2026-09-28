'use client'

import * as React from 'react'

import { Field, type FieldSize } from './field.client'
import { FieldClearAffordanceButton } from './field-clear-affordance.client'
import { JoinedPair } from './joined-pair-field.client'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './select.client'
import type { FieldDigits } from './field-digit-metrics'
import {
  isFieldOptionGroup,
  type FieldOption,
  type SelectFieldOptionListItem,
} from '../../form/field-config'
import { SelectOptionItem } from './select-option-item.client'

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

export type SelectTriggerConfig = {
  id?: string
  size: FieldSize
  digits?: FieldDigits
  sizingLabel?: string
  sizingLabels?: readonly string[]
  onBlur?: () => void
  placeholder?: string
  wrapControl: boolean
  grouped: boolean
}

export type SelectRootWithClearProps = {
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
  triggerConfig: SelectTriggerConfig
  options: SelectFieldOptionListItem[]
}

function renderSelectTrigger(
  {
    id,
    size,
    digits,
    sizingLabel,
    sizingLabels,
    onBlur,
    placeholder,
    grouped,
  }: SelectTriggerConfig,
  triggerRef: React.Ref<HTMLButtonElement>,
) {
  return (
    <SelectTrigger
      ref={triggerRef}
      id={id}
      size={size}
      digits={digits}
      sizingLabel={sizingLabel}
      sizingLabels={sizingLabels}
      grouped={grouped}
      groupedPosition={grouped ? 'start' : undefined}
      className={grouped ? 'min-w-0 w-full' : undefined}
      onBlur={onBlur}
    >
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
  )
}

export function SelectRootWithClear({
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
  triggerConfig,
  options,
}: SelectRootWithClearProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const showClear = clearable && resolvedValue !== undefined && !disabled
  const trigger = renderSelectTrigger({ ...triggerConfig, grouped: showClear }, triggerRef)
  const select = (
    <Select
      value={resolvedValue}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      disabled={disabled}
    >
      {triggerConfig.wrapControl ? <Field.Control>{trigger}</Field.Control> : trigger}
      {renderSelectContent(options)}
    </Select>
  )

  if (!showClear) {
    return select
  }

  const clearLabel = clearAccessibleName ?? `Clear ${label}`

  return (
    <JoinedPair.Root layout="stretch" className="w-full">
      <div className="min-w-0">{select}</div>
      <JoinedPair.Divider />
      <FieldClearAffordanceButton
        size={size}
        accessibleName={clearLabel}
        onClear={() => {
          if (onClear) {
            onClear()
          } else {
            onValueChange?.('')
          }
          requestAnimationFrame(() => {
            triggerRef.current?.focus()
          })
        }}
      />
    </JoinedPair.Root>
  )
}
