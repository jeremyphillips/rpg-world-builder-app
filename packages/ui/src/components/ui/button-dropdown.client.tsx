'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ChevronDown } from 'lucide-react'

import { resolveComboboxSearchFieldSizeForButtonSize } from '../../components/ui/field-sizing.variants'
import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { ComboboxSearchField } from './combobox-field-parts.client'
import { comboboxContentVariants } from './combobox-field.variants'
import { InteractiveListEmpty, InteractiveList } from './interactive-list.client'
import { InteractiveListGroupHeading } from './interactive-list-group-heading.client'
import { InteractiveListRow } from './interactive-list-row.client'
import { InteractiveListViewport } from './interactive-list-viewport.client'
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
      <InteractiveListRow
        name={item.label}
        metadata={resolveButtonDropdownMetadata(item)}
        disabled
        interactive={false}
      />
    )
  }

  return (
    <InteractiveListRow
      name={item.label}
      metadata={resolveButtonDropdownMetadata(item)}
      highlighted={isHighlighted}
      asChild
    >
      <button
        id={optionId}
        type="button"
        role="menuitem"
        onMouseEnter={onHighlight}
        onClick={onSelect}
      />
    </InteractiveListRow>
  )
}

/** Outline button that opens a searchable, grouped menu of interactive list rows. */
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
  const searchFieldSize = resolveComboboxSearchFieldSizeForButtonSize(size)

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
          aria-haspopup="menu"
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

          <InteractiveListViewport>
            <div
              ref={listboxRef}
              id={listboxId}
              role="menu"
              tabIndex={enableSearch ? undefined : -1}
              aria-label={label}
              aria-activedescendant={enableSearch ? undefined : activeOptionId}
              onKeyDown={enableSearch ? undefined : handleNavigationKeyDown}
            >
              {displayItems.length === 0 ? (
                <InteractiveList>
                  <InteractiveListEmpty>{emptyMessage}</InteractiveListEmpty>
                </InteractiveList>
              ) : searchActive ? (
                <InteractiveList>
                  {displayItems.map((item) => (
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
                </InteractiveList>
              ) : (
                groupedSections.map(({ group, items: sectionItems }) => (
                  <React.Fragment key={group?.id ?? '__ungrouped'}>
                    {group ? (
                      <InteractiveListGroupHeading id={`${generatedId}-group-${group.id}`}>
                        {group.label}
                      </InteractiveListGroupHeading>
                    ) : null}
                    <InteractiveList
                      role="group"
                      aria-labelledby={group ? `${generatedId}-group-${group.id}` : undefined}
                    >
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
                    </InteractiveList>
                  </React.Fragment>
                ))
              )}
            </div>
          </InteractiveListViewport>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
