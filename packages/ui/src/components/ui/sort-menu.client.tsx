'use client'

import * as React from 'react'
import { ArrowDownUp, ChevronDown } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu.client'
import {
  assertSortMenuValueInOptions,
  collectSortMenuSizingLabels,
  resolveSortMenuTriggerAccessibleName,
  resolveSortMenuTriggerLabel,
  SORT_MENU_DEFAULT_LABEL,
} from './sort-menu.lib'
import { SortMenuRadioItem } from './sort-menu-radio-item.client'
import type { SortMenuProps, SortMenuSection } from './sort-menu.types'
import {
  sortMenuContentClasses,
  sortMenuTriggerContentClasses,
  sortMenuTriggerIconClasses,
  SORT_MENU_SIZING_LABEL_ATTR,
  sortMenuTriggerSizerGhostClasses,
  sortMenuTriggerSizerGridClasses,
  sortMenuTriggerSizerLiveClasses,
} from './sort-menu.variants'

export type { SortMenuOption, SortMenuProps, SortMenuSection } from './sort-menu.types'
export {
  SORT_MENU_DEFAULT_LABEL,
  sortMenuFlatSections,
  flattenSortMenuOptions,
} from './sort-menu.lib'

function SortMenuTriggerSizer({
  labels,
  children,
}: {
  labels: readonly string[]
  children: React.ReactNode
}) {
  return (
    <span className={sortMenuTriggerSizerGridClasses}>
      {labels.map((label) => (
        <span
          key={label}
          {...{ [SORT_MENU_SIZING_LABEL_ATTR]: '' }}
          aria-hidden
          className={sortMenuTriggerSizerGhostClasses}
        >
          {label}
        </span>
      ))}
      <span className={sortMenuTriggerSizerLiveClasses}>{children}</span>
    </span>
  )
}

function SortMenuSections<T extends string>({
  sections,
  value,
  onValueChange,
}: {
  sections: readonly SortMenuSection<T>[]
  value: T
  onValueChange: (value: T) => void
}) {
  const ungrouped = sections.filter(
    (section): section is Extract<SortMenuSection<T>, { type: 'ungrouped' }> =>
      section.type === 'ungrouped',
  )
  const grouped = sections.filter(
    (section): section is Extract<SortMenuSection<T>, { type: 'group' }> =>
      section.type === 'group',
  )
  const ungroupedOptions = ungrouped.flatMap((section) => section.options)
  const hasUngrouped = ungroupedOptions.length > 0
  const groupedWithOptions = grouped.filter((section) => section.options.length > 0)

  return (
    <DropdownMenuRadioGroup value={value} onValueChange={(next) => onValueChange(next as T)}>
      {ungroupedOptions.map((option) => (
        <SortMenuRadioItem key={option.value} value={option.value}>
          {option.label}
        </SortMenuRadioItem>
      ))}
      {hasUngrouped && groupedWithOptions.length > 0 ? <DropdownMenuSeparator /> : null}
      {groupedWithOptions.map((section) => (
        <React.Fragment key={section.heading}>
          <DropdownMenuLabel>{section.heading}</DropdownMenuLabel>
          {section.options.map((option) => (
            <SortMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </SortMenuRadioItem>
          ))}
        </React.Fragment>
      ))}
    </DropdownMenuRadioGroup>
  )
}

/** Toolbar sort disclosure — DropdownMenu radio groups on a compact ghost button. */
export function SortMenu<T extends string>({
  value,
  sections,
  onValueChange,
  label = SORT_MENU_DEFAULT_LABEL,
  variant = 'outline',
  size = 'sm',
  density = 'default',
  disabled,
  className,
}: SortMenuProps<T>) {
  const valueIsValid = assertSortMenuValueInOptions(sections, value)
  const triggerLabel = resolveSortMenuTriggerLabel(sections, value)
  const sizingLabels = collectSortMenuSizingLabels(sections)
  const triggerDisabled = disabled || !valueIsValid || triggerLabel == null
  const accessibleName =
    triggerLabel != null ? resolveSortMenuTriggerAccessibleName(label, triggerLabel) : label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant={variant}
          size={size}
          density={density}
          disabled={triggerDisabled}
          aria-label={accessibleName}
          title={triggerLabel ?? undefined}
          className={cn(sortMenuTriggerIconClasses, className)}
        >
          <span className={sortMenuTriggerContentClasses()}>
            <ArrowDownUp aria-hidden />
            {triggerLabel != null ? (
              <SortMenuTriggerSizer labels={sizingLabels}>{triggerLabel}</SortMenuTriggerSizer>
            ) : null}
            <ChevronDown aria-hidden />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={sortMenuContentClasses}>
        <SortMenuSections sections={sections} value={value} onValueChange={onValueChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
