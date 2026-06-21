'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Check, ChevronDown, Search } from 'lucide-react'

import { cn } from '../../lib/utils'
import { DismissibleBadge } from './dismissible-badge.client'
import { Field, type FieldSize } from './field.client'
import { fieldControlVariants } from './field-control.variants'
import type { FieldWidth } from './field-control.variants'
import { Input } from './input.client'
import { Spinner } from './spinner'
import { InfoTooltip } from './tooltip.client'
import {
  comboboxChipRowVariants,
  comboboxContentVariants,
  comboboxEmptyVariants,
  comboboxListVariants,
  comboboxOptionVariants,
  comboboxSearchRowVariants,
} from './combobox-field.variants'

export interface ComboboxFieldOption {
  label: string
  value: string
  disabled?: boolean
  /** Secondary line text (e.g. source badge copy). Included in search matching. */
  description?: string
}

export interface ComboboxFieldProps {
  id: string
  label: string
  options: ComboboxFieldOption[]
  /**
   * `true` (default) — value is `string[]`; selected values render as removable chips.
   * `false` — value is `string`; picking an option closes the panel.
   */
  multiple?: boolean
  /** Maximum selections when `multiple` is true. */
  max?: number
  value?: string | number | Array<string | number>
  onChange?: (value: string | string[]) => void
  onBlur?: () => void
  error?: string
  hint?: string
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  loading?: boolean
  width?: FieldWidth
  size?: FieldSize
  placeholder?: string
  emptyMessage?: string
}

function normalizeSelected(multiple: boolean, value: ComboboxFieldProps['value']): string[] {
  if (multiple) {
    return Array.isArray(value) ? value.map(String) : []
  }
  return value != null && value !== '' ? [String(value)] : []
}

function optionMatchesQuery(option: ComboboxFieldOption, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return (
    option.label.toLowerCase().includes(normalized) ||
    option.value.toLowerCase().includes(normalized) ||
    (option.description?.toLowerCase().includes(normalized) ?? false)
  )
}

function resolveOption(value: string, options: ComboboxFieldOption[]): ComboboxFieldOption {
  return options.find((option) => option.value === value) ?? { value, label: value }
}

function nextMultiSelection(
  selected: string[],
  optionValue: string,
  max: number | undefined,
): string[] {
  if (selected.includes(optionValue)) return selected.filter((value) => value !== optionValue)
  if (max !== undefined && selected.length >= max) return selected
  return [...selected, optionValue]
}

interface ComboboxFieldControlProps {
  label: string
  options: ComboboxFieldOption[]
  multiple: boolean
  max?: number
  selected: string[]
  onChange?: (value: string | string[]) => void
  onBlur?: () => void
  disabled?: boolean
  loading?: boolean
  size: FieldSize
  placeholder: string
  emptyMessage: string
}

function ComboboxFieldControl({
  label,
  options,
  multiple,
  max,
  selected,
  onChange,
  onBlur,
  disabled,
  loading,
  size,
  placeholder,
  emptyMessage,
}: ComboboxFieldControlProps) {
  const generatedId = React.useId()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(0)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const listboxId = `${generatedId}-listbox`
  const searchId = `${generatedId}-search`

  const filteredOptions = React.useMemo(
    () => options.filter((option) => optionMatchesQuery(option, query)),
    [options, query],
  )

  const highlightedIndex =
    filteredOptions.length === 0 ? 0 : Math.min(activeIndex, filteredOptions.length - 1)

  const selectedOptions = React.useMemo(
    () => selected.map((value) => resolveOption(value, options)),
    [options, selected],
  )

  const triggerLabel = React.useMemo(() => {
    if (multiple) {
      if (selected.length === 0) return placeholder
      return `${selected.length} selected`
    }
    if (selected.length === 0) return placeholder
    return resolveOption(selected[0]!, options).label
  }, [multiple, options, placeholder, selected])

  const triggerText = loading ? placeholder : triggerLabel

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setQuery('')
      setActiveIndex(0)
      onBlur?.()
    }
  }

  function emitChange(nextSelected: string[]) {
    if (multiple) {
      onChange?.(nextSelected)
      return
    }
    onChange?.(nextSelected[0] ?? '')
  }

  function toggleOption(optionValue: string) {
    if (disabled || loading) return
    if (multiple) {
      emitChange(nextMultiSelection(selected, optionValue, max))
      return
    }
    const nextValue = selected[0] === optionValue ? '' : optionValue
    emitChange(nextValue ? [nextValue] : [])
    setOpen(false)
  }

  function removeValue(optionValue: string) {
    if (disabled || loading) return
    emitChange(selected.filter((value) => value !== optionValue))
  }

  function selectActiveOption() {
    const option = filteredOptions[highlightedIndex]
    if (!option || option.disabled) return
    toggleOption(option.value)
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, Math.max(filteredOptions.length - 1, 0)))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      selectActiveOption()
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
    }
  }

  const atMax = max !== undefined && selected.length >= max

  return (
    <div className="space-y-0">
      <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <Field.Control>
          <PopoverPrimitive.Trigger asChild>
            <button
              type="button"
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-haspopup="listbox"
              aria-busy={loading || undefined}
              disabled={disabled || loading}
              onBlur={onBlur}
              className={cn(
                fieldControlVariants({ size }),
                'items-center justify-between gap-2 text-left [&>span]:line-clamp-1',
                (selected.length === 0 || loading) && 'text-muted-foreground',
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

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className={comboboxContentVariants()}
            onOpenAutoFocus={(event) => {
              event.preventDefault()
              searchInputRef.current?.focus()
            }}
          >
            <div className={comboboxSearchRowVariants()}>
              <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <Input
                ref={searchInputRef}
                id={searchId}
                type="search"
                size="sm"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setActiveIndex(0)
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder={`Search ${label.toLowerCase()}…`}
                aria-label={`Search ${label}`}
                aria-controls={listboxId}
                aria-activedescendant={
                  filteredOptions[highlightedIndex]
                    ? `${generatedId}-option-${filteredOptions[highlightedIndex]!.value}`
                    : undefined
                }
                className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

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
                  const isDisabled = Boolean(option.disabled || (multiple && atMax && !isSelected))
                  return (
                    <button
                      key={option.value}
                      id={`${generatedId}-option-${option.value}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      data-active={index === highlightedIndex}
                      data-disabled={isDisabled}
                      disabled={isDisabled}
                      className={comboboxOptionVariants()}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => toggleOption(option.value)}
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate">{option.label}</span>
                        {option.description ? (
                          <span className="truncate text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                      {isSelected ? (
                        <Check className="size-4 shrink-0" aria-hidden />
                      ) : (
                        <span className="size-4 shrink-0" aria-hidden />
                      )}
                    </button>
                  )
                })
              ) : (
                <p className={comboboxEmptyVariants()}>{emptyMessage}</p>
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {multiple && selectedOptions.length > 0 ? (
        <div className={comboboxChipRowVariants()} role="group" aria-label={`Selected ${label}`}>
          {selectedOptions.map((option) => (
            <DismissibleBadge
              key={option.value}
              label={option.label}
              disabled={disabled || loading}
              onDismiss={() => removeValue(option.value)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** Searchable dropdown for picking one or many values from a large option list. */
export function ComboboxField({
  id,
  label,
  options,
  multiple = true,
  max,
  value,
  onChange,
  onBlur,
  error,
  hint,
  info,
  required,
  disabled,
  loading,
  width,
  size = 'md',
  placeholder = 'Select…',
  emptyMessage = 'No options found.',
}: ComboboxFieldProps) {
  const selected = React.useMemo(() => normalizeSelected(multiple, value), [multiple, value])

  return (
    <Field.Root id={id} error={error} hint={hint} required={required} width={width} size={size}>
      <Field.Label>
        {label}
        {info ? <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip> : null}
      </Field.Label>
      <ComboboxFieldControl
        label={label}
        options={options}
        multiple={multiple}
        max={max}
        selected={selected}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        loading={loading}
        size={size}
        placeholder={placeholder}
        emptyMessage={emptyMessage}
      />
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  )
}
