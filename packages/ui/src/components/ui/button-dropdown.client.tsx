'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ChevronDown } from 'lucide-react'

import { buttonSizeToComboboxFieldSize } from '../../components/ui/field-sizing.variants'
import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { ComboboxSearchField } from './combobox-field-parts.client'
import { comboboxContentVariants } from './combobox-field.variants'
import { ListResultEmpty, ListResultList } from './list-result-list.client'
import { ListResultGroupHeading } from './list-result-group-heading.client'
import { ListResultItem } from './list-result-item.client'
import { ListResultViewport } from './list-result-viewport.client'
import { useButtonDropdownControl } from './use-button-dropdown-control.client'
import type {
  ButtonDropdownGroup,
  ButtonDropdownItem,
  ButtonDropdownProps,
} from './button-dropdown.types'

export type {
  ButtonDropdownGroup,
  ButtonDropdownItem,
  ButtonDropdownProps,
} from './button-dropdown.types'

function groupHeadingsForItems(
  items: readonly ButtonDropdownItem[],
  groups: readonly ButtonDropdownGroup[],
  searchActive: boolean,
): Array<{ group: ButtonDropdownGroup | null; items: ButtonDropdownItem[] }> {
  if (searchActive) return []

  const knownGroupIds = new Set(groups.map((group) => group.id))
  const byGroup = new Map<string, ButtonDropdownItem[]>()
  const ungrouped: ButtonDropdownItem[] = []

  for (const item of items) {
    if (item.groupId && knownGroupIds.has(item.groupId)) {
      const list = byGroup.get(item.groupId) ?? []
      list.push(item)
      byGroup.set(item.groupId, list)
      continue
    }
    ungrouped.push(item)
  }

  const sections: Array<{ group: ButtonDropdownGroup | null; items: ButtonDropdownItem[] }> = groups
    .map((group) => ({ group, items: byGroup.get(group.id) ?? [] }))
    .filter((entry) => entry.items.length > 0)

  if (ungrouped.length > 0) {
    sections.push({ group: null, items: ungrouped })
  }

  return sections
}

function resolveButtonDropdownMetadata(item: ButtonDropdownItem): string | undefined {
  const parts = [item.metadata, item.note].filter((part) => part && part.length > 0)
  return parts.length > 0 ? parts.join(' · ') : undefined
}

function ButtonDropdownItemRow({
  item,
  optionId,
  isHighlighted,
  onHighlight,
  onSelect,
}: {
  item: ButtonDropdownItem
  optionId: string
  isHighlighted: boolean
  onHighlight: () => void
  onSelect: () => void
}) {
  if (item.disabled) {
    return (
      <ListResultItem
        name={item.label}
        metadata={resolveButtonDropdownMetadata(item)}
        disabled
        interactive={false}
      />
    )
  }

  return (
    <ListResultItem
      name={item.label}
      metadata={resolveButtonDropdownMetadata(item)}
      highlighted={isHighlighted}
      asChild
    >
      <button
        id={optionId}
        type="button"
        role="option"
        aria-selected={false}
        onMouseEnter={onHighlight}
        onClick={onSelect}
      />
    </ListResultItem>
  )
}

/** Outline button that opens a searchable, grouped menu of list-result options. */
export function ButtonDropdown({
  label,
  groups,
  items,
  enableSearch = true,
  emptyMessage = 'No options found.',
  onSelectItem,
  variant = 'outline',
  size = 'sm',
  density,
  leadingIcon,
  width = 'full',
  className,
}: ButtonDropdownProps) {
  const {
    open,
    searchActive,
    listboxId,
    searchId,
    generatedId,
    query,
    displayItems,
    selectableItems,
    highlightedIndex,
    activeOptionId,
    searchInputRef,
    listboxRef,
    handleOpenChange,
    handleNavigationKeyDown,
    handleQueryChange,
    focusPanelOnOpen,
    selectItem,
    setActiveIndex,
  } = useButtonDropdownControl({ groups, items, enableSearch, onSelectItem })
  const groupedSections = groupHeadingsForItems(displayItems, groups, searchActive)
  const searchFieldSize = buttonSizeToComboboxFieldSize[size ?? 'default']

  const highlightIndexForItem = React.useCallback(
    (item: ButtonDropdownItem) =>
      selectableItems.findIndex((candidate) => candidate.id === item.id),
    [selectableItems],
  )

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <Button
          type="button"
          variant={variant ?? 'default'}
          size={size}
          density={density}
          className={cn(width === 'fit' && 'w-fit shrink-0', className)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
        >
          {leadingIcon}
          {label}
          <ChevronDown className="size-4 opacity-50" aria-hidden />
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          side="bottom"
          avoidCollisions
          sideOffset={4}
          className={comboboxContentVariants({
            triggerWidth: width === 'fit' ? 'fit' : 'match',
          })}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            focusPanelOnOpen()
          }}
        >
          {enableSearch ? (
            <ComboboxSearchField
              label={label}
              listboxId={listboxId}
              searchId={searchId}
              size={searchFieldSize}
              query={query}
              activeOptionId={activeOptionId}
              searchInputRef={searchInputRef}
              onQueryChange={handleQueryChange}
              onSearchKeyDown={handleNavigationKeyDown}
            />
          ) : null}

          <ListResultViewport>
            <ListResultList
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              tabIndex={enableSearch ? undefined : -1}
              aria-label={label}
              aria-activedescendant={enableSearch ? undefined : activeOptionId}
              onKeyDown={enableSearch ? undefined : handleNavigationKeyDown}
            >
              {displayItems.length === 0 ? (
                <ListResultEmpty>{emptyMessage}</ListResultEmpty>
              ) : searchActive ? (
                displayItems.map((item) => (
                  <ButtonDropdownItemRow
                    key={item.id}
                    item={item}
                    optionId={`${generatedId}-option-${item.id}`}
                    isHighlighted={highlightIndexForItem(item) === highlightedIndex}
                    onHighlight={() => {
                      const index = highlightIndexForItem(item)
                      if (index >= 0) setActiveIndex(index)
                    }}
                    onSelect={() => selectItem(item.id)}
                  />
                ))
              ) : (
                groupedSections.map(({ group, items: sectionItems }) => (
                  <div
                    key={group?.id ?? '__ungrouped'}
                    role="group"
                    aria-labelledby={group ? `${generatedId}-group-${group.id}` : undefined}
                  >
                    {group ? (
                      <ListResultGroupHeading id={`${generatedId}-group-${group.id}`}>
                        {group.label}
                      </ListResultGroupHeading>
                    ) : null}
                    {sectionItems.map((item) => (
                      <ButtonDropdownItemRow
                        key={item.id}
                        item={item}
                        optionId={`${generatedId}-option-${item.id}`}
                        isHighlighted={highlightIndexForItem(item) === highlightedIndex}
                        onHighlight={() => {
                          const index = highlightIndexForItem(item)
                          if (index >= 0) setActiveIndex(index)
                        }}
                        onSelect={() => selectItem(item.id)}
                      />
                    ))}
                  </div>
                ))
              )}
            </ListResultList>
          </ListResultViewport>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
