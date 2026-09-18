'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ChevronDown, Check, Search } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Chip } from './chip.client'
import { Field, type FieldSize } from './field.client'
import { fieldControlVariants } from './field-control.variants'
import { SelectLikeCaretSlot, SelectLikeValueSlot } from './select-like-trigger-slots.client'
import { fieldSizeToChipSize } from './field-sizing.variants'
import { Spinner } from './spinner'
import { isComboboxOptionDisabled } from './combobox-field.lib'
import type {
  ComboboxFieldOption,
  ComboboxRenderOption,
  ComboboxRenderSelectedItem,
} from './combobox-field.types'
import {
  COMBOBOX_TRIGGER_OVERLAP_OFFSET,
  comboboxSelectedItemsRowVariants,
  comboboxSelectedListVariants,
  comboboxContentVariants,
  comboboxSearchInputVariants,
  comboboxSearchRowVariants,
  comboboxTriggerOpenVariants,
} from './combobox-field.variants'
import { ListResultEmpty, ListResultList } from './list-result-list.client'
import { ListResultItem } from './list-result-item.client'
import { ListResultToolbar } from './list-result-toolbar.client'
import { ListResultViewport } from './list-result-viewport.client'
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
            'inline-flex shrink-0 items-stretch gap-0 px-0 py-0 text-left',
            muted && 'text-muted-foreground',
            open && hideWhenOpen && comboboxTriggerOpenVariants(),
          )}
        >
          <SelectLikeValueSlot size={size} position="standalone" trailingSlot prose>
            <span className="truncate">{triggerText}</span>
          </SelectLikeValueSlot>
          <SelectLikeCaretSlot size={size}>
            {loading ? (
              <Spinner size="sm" variant="muted" />
            ) : (
              <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
            )}
          </SelectLikeCaretSlot>
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
  size: FieldSize
  renderOption?: ComboboxRenderOption
  onHighlight: () => void
  onSelect: () => void
}

function ComboboxOptionItem({
  option,
  optionId,
  isSelected,
  isHighlighted,
  isDisabled,
  size,
  renderOption,
  onHighlight,
  onSelect,
}: ComboboxOptionItemProps) {
  const checkSlot = isSelected ? (
    <Check className="size-4 shrink-0" aria-hidden />
  ) : (
    <span className="size-4 shrink-0" aria-hidden />
  )

  if (renderOption) {
    return (
      <ListResultItem
        highlighted={isHighlighted}
        selected={isSelected}
        disabled={isDisabled}
        content={
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span className="min-w-0 flex-1">
              {renderOption(option, { selected: isSelected, disabled: isDisabled, size })}
            </span>
            {checkSlot}
          </span>
        }
        asChild
      >
        <button
          id={optionId}
          type="button"
          role="option"
          aria-selected={isSelected}
          aria-label={option.label}
          disabled={isDisabled}
          onMouseEnter={onHighlight}
          onClick={onSelect}
        />
      </ListResultItem>
    )
  }

  return (
    <ListResultItem
      name={option.label}
      classification={option.classification}
      metadata={option.metadata}
      highlighted={isHighlighted}
      selected={isSelected}
      disabled={isDisabled}
      endSlot={checkSlot}
      asChild
    >
      <button
        id={optionId}
        type="button"
        role="option"
        aria-selected={isSelected}
        disabled={isDisabled}
        onMouseEnter={onHighlight}
        onClick={onSelect}
      />
    </ListResultItem>
  )
}

interface ComboboxSearchFieldProps {
  label: string
  listboxId: string
  searchId: string
  size: FieldSize
  query: string
  activeOptionId?: string
  filter?: React.ReactNode
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
  filter,
  searchInputRef,
  onQueryChange,
  onSearchKeyDown,
}: ComboboxSearchFieldProps) {
  return (
    <ListResultToolbar
      search={
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
      }
      filter={filter}
    />
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
  renderOption?: ComboboxRenderOption
  filter?: React.ReactNode
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
  renderOption,
  filter,
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
            filter={filter}
            searchInputRef={searchInputRef}
            onQueryChange={onQueryChange}
            onSearchKeyDown={onNavigationKeyDown}
          />
        ) : null}

        <ListResultViewport>
          <ListResultList
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            tabIndex={enableSearch ? undefined : -1}
            aria-label={label}
            aria-multiselectable={multiple || undefined}
            aria-activedescendant={enableSearch ? undefined : activeOptionId}
            onKeyDown={enableSearch ? undefined : onNavigationKeyDown}
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
                    size={size}
                    renderOption={renderOption}
                    onHighlight={() => onHighlight(index)}
                    onSelect={() => onSelect(option.value)}
                  />
                )
              })
            ) : (
              <ListResultEmpty>{emptyMessage}</ListResultEmpty>
            )}
          </ListResultList>
        </ListResultViewport>
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
