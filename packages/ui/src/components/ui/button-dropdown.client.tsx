'use client'
import { Icon } from './icon/icon'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { resolveComboboxSearchFieldSizeForButtonSize } from '../../components/ui/field-sizing.variants'
import { cn } from '../../lib/utils'
import { POPOVER_INTERACTIVE_LIST_DENSITY } from './list-density.lib'
import { ActionButton } from './action-button.client'
import { Button } from './button.client'
import { ComboboxSearchField } from './combobox-field-parts.client'
import { comboboxContentVariants } from './combobox-field.variants'
import { InteractiveListEmpty, InteractiveList } from './interactive-list.client'
import { ListGroupHeading } from './list-group-heading.client'
import { InteractiveListRow } from './interactive-list-row.client'
import { InteractiveListViewport } from './interactive-list-viewport.client'
import { useButtonDropdownControl } from './use-button-dropdown-control.client'
import { joinInlineMetadata } from '@rpg/contracts/primitives'
import { resolveFieldSearchPlaceholder } from '../../form/config/field-placeholder.lib'
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
  if (item.disabled && item.disabledReason) return item.disabledReason
  const parts = [item.metadata, item.note].filter((part) => part && part.length > 0)
  return parts.length > 0 ? joinInlineMetadata(parts) : undefined
}

function ButtonDropdownItemRow({
  item,
  optionId,
  isHighlighted,
  supportingWrap,
  onHighlight,
  onSelect,
}: {
  item: ButtonDropdownItem
  optionId: string
  isHighlighted: boolean
  supportingWrap?: boolean
  onHighlight: () => void
  onSelect: () => void
}) {
  if (item.disabled) {
    return (
      <InteractiveListRow
        name={item.label}
        classification={item.classification}
        metadata={resolveButtonDropdownMetadata(item)}
        supportingWrap={supportingWrap}
        highlighted={isHighlighted}
        disabled
        asChild
      >
        <div
          id={optionId}
          role="menuitem"
          aria-disabled="true"
          onMouseEnter={onHighlight}
          onClick={(event) => event.preventDefault()}
        />
      </InteractiveListRow>
    )
  }

  return (
    <InteractiveListRow
      name={item.label}
      classification={item.classification}
      metadata={resolveButtonDropdownMetadata(item)}
      supportingWrap={supportingWrap}
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

function ButtonDropdownItemRows({
  items,
  generatedId,
  supportingWrap,
  highlightedIndex,
  highlightIndexForItem,
  setActiveIndex,
  selectItem,
  listProps,
}: {
  items: readonly ButtonDropdownItem[]
  generatedId: string
  supportingWrap?: boolean
  highlightedIndex: number
  highlightIndexForItem: (item: ButtonDropdownItem) => number
  setActiveIndex: (index: number) => void
  selectItem: (id: string) => void
  listProps?: React.ComponentPropsWithoutRef<typeof InteractiveList>
}) {
  return (
    <InteractiveList density={POPOVER_INTERACTIVE_LIST_DENSITY} {...listProps}>
      {items.map((item) => (
        <ButtonDropdownItemRow
          key={item.id}
          item={item}
          optionId={`${generatedId}-option-${item.id}`}
          supportingWrap={supportingWrap}
          isHighlighted={highlightIndexForItem(item) === highlightedIndex}
          onHighlight={() => {
            const index = highlightIndexForItem(item)
            if (index >= 0) setActiveIndex(index)
          }}
          onSelect={() => selectItem(item.id)}
        />
      ))}
    </InteractiveList>
  )
}

function ButtonDropdownMenuItems({
  displayItems,
  searchActive,
  groupedSections,
  emptyMessage,
  generatedId,
  supportingWrap,
  highlightedIndex,
  highlightIndexForItem,
  setActiveIndex,
  selectItem,
}: {
  displayItems: readonly ButtonDropdownItem[]
  searchActive: boolean
  groupedSections: ReturnType<typeof groupHeadingsForItems>
  emptyMessage: string
  generatedId: string
  supportingWrap?: boolean
  highlightedIndex: number
  highlightIndexForItem: (item: ButtonDropdownItem) => number
  setActiveIndex: (index: number) => void
  selectItem: (id: string) => void
}) {
  if (displayItems.length === 0) {
    return (
      <InteractiveList density={POPOVER_INTERACTIVE_LIST_DENSITY}>
        <InteractiveListEmpty>{emptyMessage}</InteractiveListEmpty>
      </InteractiveList>
    )
  }
  if (searchActive) {
    return (
      <ButtonDropdownItemRows
        items={displayItems}
        generatedId={generatedId}
        supportingWrap={supportingWrap}
        highlightedIndex={highlightedIndex}
        highlightIndexForItem={highlightIndexForItem}
        setActiveIndex={setActiveIndex}
        selectItem={selectItem}
      />
    )
  }
  return groupedSections.map(({ group, items: sectionItems }) => {
    const groupLabel = group?.label.trim() ?? ''
    const groupHeadingId =
      group && groupLabel.length > 0 ? `${generatedId}-group-${group.id}` : undefined
    return (
      <React.Fragment key={group?.id ?? '__ungrouped'}>
        {groupHeadingId ? <ListGroupHeading id={groupHeadingId} label={groupLabel} /> : null}
        <ButtonDropdownItemRows
          items={sectionItems}
          generatedId={generatedId}
          supportingWrap={supportingWrap}
          highlightedIndex={highlightedIndex}
          highlightIndexForItem={highlightIndexForItem}
          setActiveIndex={setActiveIndex}
          selectItem={selectItem}
          listProps={{ role: 'group', 'aria-labelledby': groupHeadingId }}
        />
      </React.Fragment>
    )
  })
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
  leadingIcon,
  width = 'full',
  className,
  searchPlaceholder: searchPlaceholderProp,
  triggerPresentation = 'labeled',
  supportingWrap,
}: ButtonDropdownProps) {
  const searchPlaceholder = resolveFieldSearchPlaceholder({ label }, searchPlaceholderProp)
  const addIconTrigger = triggerPresentation === 'addIcon'
  const {
    open,
    searchActive,
    listboxId,
    searchId,
    generatedId,
    query,
    displayItems,
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
  const searchFieldSize = resolveComboboxSearchFieldSizeForButtonSize(
    addIconTrigger ? 'icon-sm' : size,
  )

  const highlightIndexForItem = React.useCallback(
    (item: ButtonDropdownItem) => displayItems.findIndex((candidate) => candidate.id === item.id),
    [displayItems],
  )

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        {addIconTrigger ? (
          <ActionButton
            action="add"
            variant="ghost"
            size="icon-sm"
            className={cn('shrink-0', className)}
            aria-label={label}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={listboxId}
          />
        ) : (
          <Button
            type="button"
            variant={variant ?? 'default'}
            size={size}
            className={cn(width === 'fit' && 'w-fit shrink-0', className)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={listboxId}
          >
            {leadingIcon}
            {label}
            <Icon name="chevron-down" size="lg" className="opacity-50" />
          </Button>
        )}
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
              searchPlaceholder={searchPlaceholder}
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
              <ButtonDropdownMenuItems
                displayItems={displayItems}
                searchActive={searchActive}
                groupedSections={groupedSections}
                emptyMessage={emptyMessage}
                generatedId={generatedId}
                supportingWrap={supportingWrap}
                highlightedIndex={highlightedIndex}
                highlightIndexForItem={highlightIndexForItem}
                setActiveIndex={setActiveIndex}
                selectItem={selectItem}
              />
            </div>
          </InteractiveListViewport>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
