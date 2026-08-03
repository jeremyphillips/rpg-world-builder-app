'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'

import { cn } from '../../lib/utils'
import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'
import { Input } from './input.client'
import { ListboxOptionButton } from './listbox-option.client'
import {
  comboboxContentVariants,
  comboboxEmptyVariants,
  comboboxListVariants,
} from './combobox-field.variants'
import { FieldLabelContent } from './field-label-content'
import { filterTextSuggestions, formatTextSuggestionLabel } from './text-suggestions-field.lib'

const EMPTY_SUGGESTIONS_MESSAGE = 'No suggestions match your input.'

export interface TextSuggestionsFieldProps {
  id: string
  label: string
  value: string | undefined
  suggestions: readonly string[]
  onValueChange: (value: string | undefined) => void
  placeholder?: string
  emptyMessage?: string
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  size?: FieldSize
  width?: FieldWidth
  onBlur?: () => void
}

/** Text input with an optional suggestion list — free entry is always allowed. */
export function TextSuggestionsField({
  id,
  label,
  value,
  suggestions,
  onValueChange,
  placeholder,
  emptyMessage = EMPTY_SUGGESTIONS_MESSAGE,
  error,
  hint,
  hintPosition,
  info,
  required = false,
  disabled = false,
  size = 'md',
  width = 'full',
  onBlur,
}: TextSuggestionsFieldProps) {
  const listboxId = `${id}-listbox`
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const displayValue = value ?? ''
  const filteredSuggestions = React.useMemo(
    () => filterTextSuggestions(suggestions, displayValue),
    [displayValue, suggestions],
  )
  const showPanel = open && suggestions.length > 0
  const highlightedIndex =
    filteredSuggestions.length === 0 ? -1 : Math.min(activeIndex, filteredSuggestions.length - 1)
  const hasError = Boolean(error)
  const describedBy = hasError ? `${id}-error` : hint ? `${id}-hint` : undefined

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setActiveIndex(0)
      onBlur?.()
    }
  }

  function selectSuggestion(nextValue: string) {
    onValueChange(nextValue)
    setOpen(false)
    setActiveIndex(0)
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value
    onValueChange(nextValue === '' ? undefined : nextValue)
    setOpen(true)
    setActiveIndex(0)
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showPanel || filteredSuggestions.length === 0) {
      if (event.key === 'Escape') setOpen(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, filteredSuggestions.length - 1))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
      return
    }

    if (event.key === 'Enter') {
      const suggestion = filteredSuggestions[highlightedIndex]
      if (suggestion) {
        event.preventDefault()
        selectSuggestion(formatTextSuggestionLabel(suggestion))
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
    }
  }

  return (
    <Field.Root id={id} error={error} hint={hint} required={required} size={size} width={width}>
      <FieldLayout
        hintPosition={hintPosition}
        label={
          <Field.Label id={`${id}-label`} htmlFor={id}>
            <FieldLabelContent label={label} info={info} />
          </Field.Label>
        }
        control={
          <PopoverPrimitive.Root open={showPanel} onOpenChange={handleOpenChange}>
            <PopoverPrimitive.Anchor asChild>
              <Input
                ref={inputRef}
                id={id}
                role="combobox"
                aria-expanded={showPanel}
                aria-controls={showPanel ? listboxId : undefined}
                aria-autocomplete="list"
                aria-haspopup="listbox"
                size={size}
                disabled={disabled}
                placeholder={placeholder}
                value={displayValue}
                aria-invalid={hasError || undefined}
                aria-describedby={describedBy}
                onChange={handleInputChange}
                onFocus={() => {
                  if (suggestions.length > 0) setOpen(true)
                }}
                onKeyDown={handleInputKeyDown}
                onBlur={() => {
                  window.setTimeout(() => {
                    if (!inputRef.current?.matches(':focus')) {
                      handleOpenChange(false)
                    }
                  }, 0)
                }}
              />
            </PopoverPrimitive.Anchor>

            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content
                align="start"
                side="bottom"
                avoidCollisions
                sideOffset={4}
                onOpenAutoFocus={(event) => event.preventDefault()}
                onInteractOutside={(event) => {
                  if (inputRef.current?.contains(event.target as Node)) {
                    event.preventDefault()
                  }
                }}
                className={cn(comboboxContentVariants(), 'w-[var(--radix-popover-trigger-width)]')}
              >
                <div
                  id={listboxId}
                  role="listbox"
                  aria-label={`${label} suggestions`}
                  className={comboboxListVariants()}
                >
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((suggestion, index) => {
                      const formatted = formatTextSuggestionLabel(suggestion)
                      const isSelected = displayValue.trim().toLowerCase() === suggestion
                      return (
                        <ListboxOptionButton
                          key={suggestion}
                          option={{ label: formatted, value: suggestion }}
                          isSelected={isSelected}
                          isHighlighted={index === highlightedIndex}
                          onHighlight={() => setActiveIndex(index)}
                          onSelect={() => selectSuggestion(formatted)}
                        />
                      )
                    })
                  ) : (
                    <p className={comboboxEmptyVariants()}>{emptyMessage}</p>
                  )}
                </div>
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
        }
      />
    </Field.Root>
  )
}
