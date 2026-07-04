'use client'

import * as React from 'react'

import {
  clampHighlightedIndex,
  isButtonDropdownSearchActive,
  nextHighlightedIndex,
  rankButtonDropdownItems,
  resolveSearchKeyAction,
  selectableButtonDropdownItems,
} from './button-dropdown.lib'
import type { ButtonDropdownGroup, ButtonDropdownItem } from './button-dropdown.types'

export function useButtonDropdownControl({
  groups,
  items,
  enableSearch = true,
  onSelectItem,
}: {
  groups: ButtonDropdownGroup[]
  items: ButtonDropdownItem[]
  enableSearch?: boolean
  onSelectItem: (id: string) => void
}) {
  const generatedId = React.useId()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [activeIndex, setActiveIndex] = React.useState(0)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const listboxRef = React.useRef<HTMLDivElement>(null)

  const listboxId = `${generatedId}-listbox`
  const searchId = `${generatedId}-search`
  const searchActive = isButtonDropdownSearchActive(query)

  const displayItems = React.useMemo(
    () => rankButtonDropdownItems(items, groups, query),
    [groups, items, query],
  )
  const selectableItems = React.useMemo(
    () => selectableButtonDropdownItems(displayItems),
    [displayItems],
  )
  const highlightedIndex = clampHighlightedIndex(activeIndex, selectableItems.length)
  const highlightedItem = selectableItems[highlightedIndex]
  const activeOptionId = highlightedItem ? `${generatedId}-option-${highlightedItem.id}` : undefined

  const handleOpenChange = React.useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setQuery('')
      setActiveIndex(0)
    }
  }, [])

  const selectItem = React.useCallback(
    (itemId: string) => {
      onSelectItem(itemId)
      handleOpenChange(false)
    },
    [handleOpenChange, onSelectItem],
  )

  const selectHighlightedItem = React.useCallback(() => {
    const item = selectableItems[highlightedIndex]
    if (!item) return
    selectItem(item.id)
  }, [highlightedIndex, selectItem, selectableItems])

  const handleNavigationKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const action = resolveSearchKeyAction(event.key)
      if (!action) return

      event.preventDefault()
      if (action === 'next' || action === 'previous') {
        setActiveIndex((index) => nextHighlightedIndex(action, index, selectableItems.length))
        return
      }
      if (action === 'select') {
        selectHighlightedItem()
        return
      }
      handleOpenChange(false)
    },
    [handleOpenChange, selectableItems.length, selectHighlightedItem],
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
    searchActive,
    listboxId,
    searchId,
    generatedId,
    query,
    displayItems,
    selectableItems,
    highlightedIndex,
    highlightedItem,
    activeOptionId,
    searchInputRef,
    listboxRef,
    handleOpenChange,
    handleNavigationKeyDown,
    handleQueryChange,
    focusPanelOnOpen,
    selectItem,
    setActiveIndex,
  }
}
