'use client'

import * as React from 'react'

import {
  clampHighlightedIndex,
  emitComboboxChange,
  filterOptions,
  nextHighlightedIndex,
  nextMultiSelection,
  nextSingleSelection,
  resolveOption,
  resolveSearchKeyAction,
  resolveTriggerLabel,
} from './combobox-field.lib'
import type { ComboboxFieldControlProps } from './combobox-field.types'

export function useComboboxControl({
  label: _label,
  options,
  multiple,
  max,
  selected,
  onChange,
  onBlur,
  disabled,
  loading,
  placeholder,
  enableSearch = true,
  resolveFilteredOptions,
}: ComboboxFieldControlProps) {
  const generatedId = React.useId()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(0)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const listboxRef = React.useRef<HTMLDivElement>(null)

  const listboxId = `${generatedId}-listbox`
  const searchId = `${generatedId}-search`
  const isInteractionDisabled = Boolean(disabled || loading)
  const atMax = max !== undefined && selected.length >= max

  const filteredOptions = React.useMemo(
    () =>
      resolveFilteredOptions
        ? resolveFilteredOptions(options, query, selected)
        : filterOptions(options, query, selected),
    [options, query, resolveFilteredOptions, selected],
  )
  const highlightedIndex = clampHighlightedIndex(activeIndex, filteredOptions.length)
  const selectedOptions = React.useMemo(
    () => selected.map((value) => resolveOption(value, options)),
    [options, selected],
  )
  const triggerLabel = React.useMemo(
    () => resolveTriggerLabel(multiple, selected, placeholder, options),
    [multiple, options, placeholder, selected],
  )
  const triggerText = loading ? placeholder : triggerLabel
  const activeOptionId = filteredOptions[highlightedIndex]
    ? `${generatedId}-option-${filteredOptions[highlightedIndex]!.value}`
    : undefined

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)
      if (!nextOpen) {
        setQuery('')
        setActiveIndex(0)
        onBlur?.()
      }
    },
    [onBlur],
  )

  const toggleOption = React.useCallback(
    (optionValue: string) => {
      if (isInteractionDisabled) return
      if (multiple) {
        emitComboboxChange(multiple, nextMultiSelection(selected, optionValue, max), onChange)
        return
      }
      emitComboboxChange(multiple, nextSingleSelection(selected, optionValue), onChange)
      setOpen(false)
    },
    [isInteractionDisabled, max, multiple, onChange, selected],
  )

  const removeValue = React.useCallback(
    (optionValue: string) => {
      if (isInteractionDisabled) return
      emitComboboxChange(
        multiple,
        selected.filter((value) => value !== optionValue),
        onChange,
      )
    },
    [isInteractionDisabled, multiple, onChange, selected],
  )

  const selectActiveOption = React.useCallback(() => {
    const option = filteredOptions[highlightedIndex]
    if (!option || option.disabled) return
    toggleOption(option.value)
  }, [filteredOptions, highlightedIndex, toggleOption])

  const handleNavigationKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const action = resolveSearchKeyAction(event.key)
      if (!action) return

      event.preventDefault()
      if (action === 'next' || action === 'previous') {
        setActiveIndex((index) => nextHighlightedIndex(action, index, filteredOptions.length))
        return
      }
      if (action === 'select') {
        selectActiveOption()
        return
      }
      setOpen(false)
    },
    [filteredOptions.length, selectActiveOption],
  )

  const handleQueryChange = React.useCallback((value: string) => {
    setQuery(value)
    setActiveIndex(0)
  }, [])

  const focusSearchInput = React.useCallback(() => {
    searchInputRef.current?.focus()
  }, [])

  const focusListbox = React.useCallback(() => {
    listboxRef.current?.focus()
  }, [])

  const focusPanelOnOpen = React.useCallback(() => {
    if (enableSearch) {
      focusSearchInput()
      return
    }
    focusListbox()
  }, [enableSearch, focusListbox, focusSearchInput])

  return {
    open,
    enableSearch,
    listboxId,
    searchId,
    generatedId,
    searchInputRef,
    listboxRef,
    filteredOptions,
    highlightedIndex,
    selectedOptions,
    triggerText,
    activeOptionId,
    atMax,
    isInteractionDisabled,
    multiple,
    query,
    handleOpenChange,
    toggleOption,
    removeValue,
    handleNavigationKeyDown,
    handleQueryChange,
    focusPanelOnOpen,
    setActiveIndex,
  }
}
