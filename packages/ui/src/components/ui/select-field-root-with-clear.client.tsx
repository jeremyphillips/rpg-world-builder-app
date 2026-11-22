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
  flattenSelectFieldOptions,
  isFieldOptionGroup,
  type FieldOption,
  type SelectFieldOptionListItem,
} from '../../form/field-config/field-options'
import { SelectOptionItem } from './select-option-item.client'
import { SelectOptionRowContent } from './select-option-row-content.client'
import {
  UI_FIELD_GROUP_INPUT_COLUMN_CLASS,
  resolveFieldGroupActionSegmentClasses,
} from './field-group.styles'

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
  onOpenChange?: (open: boolean) => void
  triggerConfig: SelectTriggerConfig
  options: SelectFieldOptionListItem[]
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
  onOpenChange,
  triggerConfig,
  options,
}: SelectRootWithClearProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const flatOptions = React.useMemo(() => flattenSelectFieldOptions(options), [options])
  const selectedOption = React.useMemo(
    () => flatOptions.find((option) => option.value === resolvedValue),
    [flatOptions, resolvedValue],
  )
  const showClear = clearable && resolvedValue !== undefined && !disabled
  const trigger = (
    <SelectTrigger
      ref={triggerRef}
      id={triggerConfig.id}
      size={triggerConfig.size}
      digits={triggerConfig.digits}
      sizingLabel={triggerConfig.sizingLabel}
      sizingLabels={triggerConfig.sizingLabels}
      grouped={showClear}
      groupedPosition={showClear ? 'start' : undefined}
      className={showClear ? 'min-w-0 max-w-full' : undefined}
      onBlur={triggerConfig.onBlur}
    >
      <SelectValue placeholder={triggerConfig.placeholder}>
        {selectedOption ? (
          <SelectOptionRowContent
            label={selectedOption.label}
            trailing={selectedOption.trailingScope === 'item' ? undefined : selectedOption.trailing}
            disabled={selectedOption.disabled}
            disabledReason={selectedOption.disabledReason}
            mode="trigger"
          />
        ) : null}
      </SelectValue>
    </SelectTrigger>
  )
  const select = (
    <Select
      value={resolvedValue}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      onOpenChange={onOpenChange}
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
    <JoinedPair.Root layout="stretch" size={size} className="w-full">
      <div className={UI_FIELD_GROUP_INPUT_COLUMN_CLASS}>{select}</div>
      <JoinedPair.Divider />
      <div className={resolveFieldGroupActionSegmentClasses(size)}>
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
      </div>
    </JoinedPair.Root>
  )
}
