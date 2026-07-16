'use client'

import { ChipsFieldOptions, FilterPopover, Text } from '@rpg/ui'

import { catalogPickerFilterLabelClasses } from './catalog-picker-filter-toolbar.variants'
import { catalogPickerMechanicsFilterPopoverClasses } from './catalog-picker-mechanics-filter-popover.variants'

export type CatalogPickerFilterPopoverGroup = {
  id: string
  label: string
  options: readonly { value: string; label: string }[]
  selectedValues: readonly string[]
  onSelectedValuesChange: (values: string[]) => void
}

export type CatalogPickerFilterPopoverProps = {
  triggerLabel: string
  triggerAriaLabel: string
  groups: readonly CatalogPickerFilterPopoverGroup[]
}

export function CatalogPickerFilterPopover({
  triggerLabel,
  triggerAriaLabel,
  groups,
}: CatalogPickerFilterPopoverProps) {
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

export type CatalogPickerLevelChipOption = {
  value: string
  label: string
}

export type CatalogPickerLevelChipsProps = {
  id: string
  label?: string
  options: readonly CatalogPickerLevelChipOption[]
  selectedValues: readonly string[]
  onSelectedValuesChange: (values: string[]) => void
}

export function CatalogPickerLevelChips({
  id,
  label = 'Levels',
  options,
  selectedValues,
  onSelectedValuesChange,
}: CatalogPickerLevelChipsProps) {
  const labelId = `${id}-label`

  return (
    <div className="flex flex-col gap-2">
      <Text as="span" id={labelId} className={catalogPickerFilterLabelClasses}>
        {label}
      </Text>
      <ChipsFieldOptions
        id={id}
        labelledBy={labelId}
        options={[...options]}
        multiple
        value={[...selectedValues]}
        onChange={(value) => onSelectedValuesChange(Array.isArray(value) ? value.map(String) : [])}
        chipSize="sm"
        showSelectedCheckmark={false}
      />
    </div>
  )
}
