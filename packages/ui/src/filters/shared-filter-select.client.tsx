'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.client'
import type { FieldSize } from '../components/ui/field.client'
import { FILTER_SELECT_ALL_VALUE } from './filter-bar.variants'

export type SharedFilterSelectOption = {
  label: string
  value: string
  disabled?: boolean
}

export interface SharedFilterSelectMenuProps {
  options: readonly SharedFilterSelectOption[]
  allOptionLabel?: string
  showAllOption?: boolean
}

/** Shared filter select menu items (All row + concrete slugs). */
export function SharedFilterSelectMenu({
  options,
  allOptionLabel = 'All',
  showAllOption = true,
}: SharedFilterSelectMenuProps) {
  return (
    <>
      {showAllOption ? (
        <SelectItem value={FILTER_SELECT_ALL_VALUE}>{allOptionLabel}</SelectItem>
      ) : null}
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </SelectItem>
      ))}
    </>
  )
}

export interface SharedFilterSelectProps {
  id?: string
  ariaLabel: string
  options: readonly SharedFilterSelectOption[]
  /** Radix wire value — use `FILTER_SELECT_ALL_VALUE` for unrestricted. */
  selectValue: string
  onSelectValueChange: (wireValue: string) => void
  size?: FieldSize
  allOptionLabel?: string
  showAllOption?: boolean
  disabled?: boolean
  triggerClassName?: string
}

/** Lower-level filter dimension select — injects All when `showAllOption` is true. */
export function SharedFilterSelect({
  id,
  ariaLabel,
  options,
  selectValue,
  onSelectValueChange,
  size = 'sm',
  allOptionLabel = 'All',
  showAllOption = true,
  disabled,
  triggerClassName,
}: SharedFilterSelectProps) {
  return (
    <Select value={selectValue} onValueChange={onSelectValueChange} disabled={disabled}>
      <SelectTrigger id={id} size={size} aria-label={ariaLabel} className={triggerClassName}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SharedFilterSelectMenu
          options={options}
          allOptionLabel={allOptionLabel}
          showAllOption={showAllOption}
        />
      </SelectContent>
    </Select>
  )
}
