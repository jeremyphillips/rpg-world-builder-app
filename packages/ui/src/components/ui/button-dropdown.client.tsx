'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { ChevronDown } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { ComboboxSearchField } from './combobox-field-parts.client'
import {
  comboboxContentVariants,
  comboboxEmptyVariants,
  comboboxListVariants,
} from './combobox-field.variants'
import { Eyebrow } from './eyebrow'
import { PreviewCard } from './preview-card.client'
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
      <div className="px-1 py-0.5" aria-disabled="true">
        <PreviewCard
          title={item.label}
          description={item.description}
          tone="transparent"
          density="compact"
          footerSlot={
            item.note ? <span className="text-muted-foreground">{item.note}</span> : undefined
          }
          className="opacity-50"
        />
      </div>
    )
  }

  return (
    <div className="px-1 py-0.5" onMouseEnter={onHighlight}>
      <PreviewCard
        title={item.label}
        description={item.description}
        tone="transparent"
        density="compact"
        interactive
        optionId={optionId}
        isHighlighted={isHighlighted}
        footerSlot={
          item.note ? <span className="text-muted-foreground">{item.note}</span> : undefined
        }
        onSelect={onSelect}
      />
    </div>
  )
}

/** Outline button that opens a searchable, grouped menu of preview-card options. */
export function ButtonDropdown({
  label,
  groups,
  items,
  enableSearch = true,
  emptyMessage = 'No options found.',
  onSelectItem,
  variant = 'outline',
  size = 'sm',
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
          variant={variant}
          size={size}
          className={className}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
        >
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
          className={cn(comboboxContentVariants(), 'min-w-[var(--radix-popover-trigger-width)]')}
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
              size="sm"
              query={query}
              activeOptionId={activeOptionId}
              searchInputRef={searchInputRef}
              onQueryChange={handleQueryChange}
              onSearchKeyDown={handleNavigationKeyDown}
            />
          ) : null}

          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            tabIndex={enableSearch ? undefined : -1}
            aria-label={label}
            aria-activedescendant={enableSearch ? undefined : activeOptionId}
            onKeyDown={enableSearch ? undefined : handleNavigationKeyDown}
            className={comboboxListVariants()}
          >
            {displayItems.length === 0 ? (
              <p className={comboboxEmptyVariants()}>{emptyMessage}</p>
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
                <div key={group?.id ?? '__ungrouped'} className="py-1">
                  {group ? (
                    <div className="px-3 pb-1">
                      <Eyebrow size="xs">{group.label}</Eyebrow>
                    </div>
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
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
