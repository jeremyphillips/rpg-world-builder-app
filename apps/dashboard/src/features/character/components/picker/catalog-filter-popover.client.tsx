'use client'

import { FilterPopover } from '@rpg/ui'

import { catalogPickerMechanicsFilterPopoverClasses } from './catalog-picker-mechanics-filter-popover.variants'

export type CatalogFilterPopoverGroup = {
  id: string
  label: string
  options: readonly { value: string; label: string }[]
  selectedValues: readonly string[]
  onSelectedValuesChange: (values: string[]) => void
}

export type CatalogFilterPopoverProps = {
  triggerLabel: string
  triggerAriaLabel: string
  groups: readonly CatalogFilterPopoverGroup[]
}

export function CatalogFilterPopover({
  triggerLabel,
  triggerAriaLabel,
  groups,
}: CatalogFilterPopoverProps) {
  return (
    <FilterPopover
      triggerLabel={triggerLabel}
      triggerAriaLabel={triggerAriaLabel}
      groups={groups}
      contentClassName={catalogPickerMechanicsFilterPopoverClasses.content}
      gridClassName={catalogPickerMechanicsFilterPopoverClasses.grid}
      primaryColumnClassName={catalogPickerMechanicsFilterPopoverClasses.primaryColumn}
      secondaryColumnClassName={catalogPickerMechanicsFilterPopoverClasses.secondaryColumn}
    />
  )
}
