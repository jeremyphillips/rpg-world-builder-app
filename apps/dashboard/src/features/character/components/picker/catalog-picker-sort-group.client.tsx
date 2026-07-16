'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Text } from '@rpg/ui'

import {
  catalogPickerSortFilterClasses,
  catalogPickerSortLabelClasses,
} from './catalog-picker-filter-toolbar.variants'

export type CatalogPickerSortOption<TMode extends string = string> = {
  value: TMode
  label: string
}

export type CatalogPickerSortGroupProps<TMode extends string = string> = {
  label?: string
  ariaLabel?: string
  triggerAriaLabel?: string
  value: TMode
  options: readonly CatalogPickerSortOption<TMode>[]
  onValueChange: (mode: TMode) => void
}

export function CatalogPickerSortGroup<TMode extends string = string>({
  label = 'Sort',
  ariaLabel = 'Sort items',
  triggerAriaLabel = 'Sort order',
  value,
  options,
  onValueChange,
}: CatalogPickerSortGroupProps<TMode>) {
  return (
    <div className={catalogPickerSortFilterClasses} role="group" aria-label={ariaLabel}>
      <Text as="span" className={catalogPickerSortLabelClasses}>
        {label}
      </Text>
      <Select value={value} onValueChange={(next) => onValueChange(next as TMode)}>
        <SelectTrigger size="sm" aria-label={triggerAriaLabel}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
