'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Check, ChevronDown, Search } from 'lucide-react'

import { cn } from '../../lib/utils'
import { DismissibleBadge } from './dismissible-badge.client'
import { Field, type FieldSize } from './field.client'
import { fieldControlVariants } from './field-control.variants'
import { Spinner } from './spinner'
import { isComboboxOptionDisabled } from './combobox-field.lib'
import type { ComboboxFieldOption } from './combobox-field.types'
import {
  COMBOBOX_TRIGGER_OVERLAP_OFFSET,
  comboboxChipRowVariants,
  comboboxContentVariants,
  comboboxEmptyVariants,
  comboboxListVariants,
  comboboxOptionVariants,
  comboboxSearchInputVariants,
  comboboxSearchRowVariants,
  comboboxTriggerOpenVariants,
} from './combobox-field.variants'

interface ComboboxTriggerProps {
  listboxId: string
  open: boolean
  size: FieldSize
  triggerText: string
  loading?: boolean
  disabled?: boolean
  muted: boolean
  onBlur?: () => void
}

export function ComboboxTrigger({
  listboxId,
  open,
  size,
  triggerText,
  loading,
  disabled,
  muted,
  onBlur,
}: ComboboxTriggerProps) {
  return (
    <Field.Control>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-busy={loading || undefined}
          disabled={disabled}
          onBlur={onBlur}
          className={cn(
            fieldControlVariants({ size }),
            'items-center justify-between gap-2 text-left [&>span]:line-clamp-1',
            muted && 'text-muted-foreground',
            open && comboboxTriggerOpenVariants(),
          )}
        >
          <span className="truncate">{triggerText}</span>
          {loading ? (
            <Spinner size="sm" variant="muted" />
          ) : (
            <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
          )}
        </button>
      </PopoverPrimitive.Trigger>
    </Field.Control>
  )
}

interface ComboboxOptionItemProps {
  option: ComboboxFieldOption
  optionId: string
  isSelected: boolean
  isHighlighted: boolean
  isDisabled: boolean
  onHighlight: () => void
  onSelect: () => void
}

function ComboboxOptionItem({
  option,
  optionId,
  isSelected,
  isHighlighted,
  isDisabled,
  onHighlight,
  onSelect,
}: ComboboxOptionItemProps) {
  return (
    <button
      id={optionId}
      type="button"
      role="option"
      aria-selected={isSelected}
      data-active={isHighlighted}
      data-disabled={isDisabled}
      disabled={isDisabled}
      className={comboboxOptionVariants()}
      onMouseEnter={onHighlight}
      onClick={onSelect}
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{option.label}</span>
        {option.description ? (
          <span className="truncate text-xs text-muted-foreground">{option.description}</span>
        ) : null}
      </span>
      {isSelected ? (
        <Check className="size-4 shrink-0" aria-hidden />
      ) : (
        <span className="size-4 shrink-0" aria-hidden />
      )}
    </button>
  )
}

interface ComboboxSearchFieldProps {
  label: string
  listboxId: string
  searchId: string
  size: FieldSize
  query: string
  activeOptionId?: string
  searchInputRef: React.RefObject<HTMLInputElement | null>
  onQueryChange: (value: string) => void
  onSearchKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

/** Search row shared by combobox panel and searchable input-select unit segments. */
export function ComboboxSearchField({
  label,
  listboxId,
  searchId,
  size,
  query,
  activeOptionId,
  searchInputRef,
  onQueryChange,
  onSearchKeyDown,
}: ComboboxSearchFieldProps) {
  return (
    <div className={comboboxSearchRowVariants({ size })}>
      <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <input
        ref={searchInputRef}
        id={searchId}
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={onSearchKeyDown}
        placeholder={`Search ${label.toLowerCase()}…`}
        aria-label={`Search ${label}`}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        className={comboboxSearchInputVariants()}
      />
    </div>
  )
}

interface ComboboxPanelProps {
  label: string
  listboxId: string
  searchId: string
  size: FieldSize
  multiple: boolean
  query: string
  emptyMessage: string
  activeOptionId?: string
  filteredOptions: ComboboxFieldOption[]
  highlightedIndex: number
  selected: string[]
  atMax: boolean
  generatedId: string
  searchInputRef: React.RefObject<HTMLInputElement | null>
  onQueryChange: (value: string) => void
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onOpenAutoFocus: () => void
  onHighlight: (index: number) => void
  onSelect: (value: string) => void
}

export function ComboboxPanel({
  label,
  listboxId,
  searchId,
  size,
  multiple,
  query,
  emptyMessage,
  activeOptionId,
  filteredOptions,
  highlightedIndex,
  selected,
  atMax,
  generatedId,
  searchInputRef,
  onQueryChange,
  onSearchKeyDown,
  onOpenAutoFocus,
  onHighlight,
  onSelect,
}: ComboboxPanelProps) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align="start"
        side="bottom"
        avoidCollisions
        sideOffset={-COMBOBOX_TRIGGER_OVERLAP_OFFSET[size]}
        className={comboboxContentVariants()}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          onOpenAutoFocus()
        }}
      >
        <ComboboxSearchField
          label={label}
          listboxId={listboxId}
          searchId={searchId}
          size={size}
          query={query}
          activeOptionId={activeOptionId}
          searchInputRef={searchInputRef}
          onQueryChange={onQueryChange}
          onSearchKeyDown={onSearchKeyDown}
        />

        <div
          id={listboxId}
          role="listbox"
          aria-label={label}
          aria-multiselectable={multiple || undefined}
          className={comboboxListVariants()}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const isSelected = selected.includes(option.value)
              const isDisabled = isComboboxOptionDisabled(option, multiple, atMax, isSelected)
              return (
                <ComboboxOptionItem
                  key={option.value}
                  option={option}
                  optionId={`${generatedId}-option-${option.value}`}
                  isSelected={isSelected}
                  isHighlighted={index === highlightedIndex}
                  isDisabled={isDisabled}
                  onHighlight={() => onHighlight(index)}
                  onSelect={() => onSelect(option.value)}
                />
              )
            })
          ) : (
            <p className={comboboxEmptyVariants()}>{emptyMessage}</p>
          )}
        </div>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}

interface ComboboxSelectedChipsProps {
  label: string
  options: ComboboxFieldOption[]
  disabled?: boolean
  onRemove: (value: string) => void
}

export function ComboboxSelectedChips({
  label,
  options,
  disabled,
  onRemove,
}: ComboboxSelectedChipsProps) {
  if (options.length === 0) return null

  return (
    <div className={comboboxChipRowVariants()} role="group" aria-label={`Selected ${label}`}>
      {options.map((option) => (
        <DismissibleBadge
          key={option.value}
          label={option.label}
          disabled={disabled}
          onDismiss={() => onRemove(option.value)}
        />
      ))}
    </div>
  )
}
