'use client'

import { X } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Field, type FieldSize } from './field.client'
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
import {
  groupedEndLabelSegmentShellClasses,
  selectCaretSlotWidthClasses,
} from './select-compact-trigger.variants'

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

function renderSelectTrigger({
  id,
  size,
  digits,
  sizingLabel,
  sizingLabels,
  onBlur,
  placeholder,
  grouped,
}: SelectTriggerConfig) {
  return (
    <SelectTrigger
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
  const showClear = clearable && resolvedValue !== undefined && !disabled
  const trigger = renderSelectTrigger({ ...triggerConfig, grouped: showClear })
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
      <button
        type="button"
        className={cn(
          groupedEndLabelSegmentShellClasses(size),
          selectCaretSlotWidthClasses[size],
          'inline-flex shrink-0 items-center justify-center text-muted-foreground hover:text-foreground',
        )}
        aria-label={clearLabel}
        onClick={() => {
          if (onClear) {
            onClear()
            return
          }
          onValueChange?.('')
        }}
      >
        <X className="size-icon-glyph-md" aria-hidden />
      </button>
    </JoinedPair.Root>
  )
}
