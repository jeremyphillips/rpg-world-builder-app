'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ChevronDown, Search } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Chip } from './chip.client'
import { Field, type FieldSize } from './field.client'
import { fieldControlVariants } from './field-control.variants'
import { fieldSizeToChipSize } from './field-sizing.variants'
import { Spinner } from './spinner'
import { isComboboxOptionDisabled } from './combobox-field.lib'
import type { ComboboxFieldOption, ComboboxRenderSelectedItem } from './combobox-field.types'
import { ListboxOptionButton } from './listbox-option.client'
import {
  COMBOBOX_TRIGGER_OVERLAP_OFFSET,
  comboboxSelectedItemsRowVariants,
  comboboxSelectedListVariants,
  comboboxContentVariants,
  comboboxEmptyVariants,
  comboboxListVariants,
  comboboxSearchInputVariants,
  comboboxSearchRowVariants,
  comboboxTriggerOpenVariants,
} from './combobox-field.variants'
import { PopoverLayerPortal } from './layer-portal-container.client'

interface ComboboxTriggerProps {
  listboxId: string
  open: boolean
  size: FieldSize
  triggerText: string
  loading?: boolean
  disabled?: boolean
  muted: boolean
  /** When false, the trigger stays visible while the panel is open. */
  hideWhenOpen?: boolean
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
  hideWhenOpen = true,
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
            open && hideWhenOpen && comboboxTriggerOpenVariants(),
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
    <ListboxOptionButton
      option={option}
      optionId={optionId}
      isSelected={isSelected}
      isHighlighted={isHighlighted}
      isDisabled={isDisabled}
      onHighlight={onHighlight}
      onSelect={onSelect}
    />
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
  enableSearch?: boolean
  query: string
  emptyMessage: string
  activeOptionId?: string
  filteredOptions: ComboboxFieldOption[]
  highlightedIndex: number
  selected: string[]
  atMax: boolean
  generatedId: string
  searchInputRef: React.RefObject<HTMLInputElement | null>
  listboxRef: React.RefObject<HTMLDivElement | null>
  onQueryChange: (value: string) => void
  onNavigationKeyDown: (event: React.KeyboardEvent) => void
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
  enableSearch = true,
  query,
  emptyMessage,
  activeOptionId,
  filteredOptions,
  highlightedIndex,
  selected,
  atMax,
  generatedId,
  searchInputRef,
  listboxRef,
  onQueryChange,
  onNavigationKeyDown,
  onOpenAutoFocus,
  onHighlight,
  onSelect,
}: ComboboxPanelProps) {
  return (
    <PopoverLayerPortal>
      <PopoverPrimitive.Content
        align="start"
        side="bottom"
        avoidCollisions
        sideOffset={enableSearch ? -COMBOBOX_TRIGGER_OVERLAP_OFFSET[size] : 4}
        className={comboboxContentVariants()}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          onOpenAutoFocus()
        }}
      >
        {enableSearch ? (
          <ComboboxSearchField
            label={label}
            listboxId={listboxId}
            searchId={searchId}
            size={size}
            query={query}
            activeOptionId={activeOptionId}
            searchInputRef={searchInputRef}
            onQueryChange={onQueryChange}
            onSearchKeyDown={onNavigationKeyDown}
          />
        ) : null}

        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          tabIndex={enableSearch ? undefined : -1}
          aria-label={label}
          aria-multiselectable={multiple || undefined}
          aria-activedescendant={enableSearch ? undefined : activeOptionId}
          onKeyDown={enableSearch ? undefined : onNavigationKeyDown}
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
    </PopoverLayerPortal>
  )
}

interface ComboboxSelectedItemsProps {
  label: string
  options: ComboboxFieldOption[]
  size: FieldSize
  disabled?: boolean
  onRemove: (value: string) => void
  renderSelectedItem?: ComboboxRenderSelectedItem
}

export function ComboboxSelectedItems({
  label,
  options,
  size,
  disabled,
  onRemove,
  renderSelectedItem,
}: ComboboxSelectedItemsProps) {
  if (options.length === 0) return null

  const chipSize = fieldSizeToChipSize[size]
  const listClassName = renderSelectedItem
    ? comboboxSelectedListVariants()
    : comboboxSelectedItemsRowVariants()

  return (
    <div className={listClassName} role="list" aria-label={`Selected ${label}`}>
      {options.map((option) => (
        <div key={option.value} role="listitem">
          {renderSelectedItem ? (
            renderSelectedItem(option, {
              onRemove: () => onRemove(option.value),
              disabled,
              size,
            })
          ) : (
            <Chip
              mode="removable"
              size={chipSize}
              disabled={disabled}
              onRemove={() => onRemove(option.value)}
              removeLabel={`Remove ${option.label}`}
            >
              {option.label}
            </Chip>
          )}
        </div>
      ))}
    </div>
  )
}

/** @deprecated Use {@link ComboboxSelectedItems}. */
export const ComboboxSelectedChips = ComboboxSelectedItems
