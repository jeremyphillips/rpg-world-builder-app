'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Text } from '@rpg/ui'

import {
  catalogPickerSortFilterClasses,
  catalogPickerSortLabelClasses,
} from './catalog-picker-filter-toolbar.variants'
import {
  resolvePickerSortTriggerLabel,
  type CatalogPickerSortOption,
} from './catalog-picker-sort-labels.lib'

export type { CatalogPickerSortOption } from './catalog-picker-sort-labels.lib'

export type CatalogSortControlProps<TMode extends string = string> = {
  label?: string
  ariaLabel?: string
  triggerAriaLabel?: string
  value: TMode
  options: readonly CatalogPickerSortOption<TMode>[]
  onValueChange: (mode: TMode) => void
}

export function CatalogSortControl<TMode extends string = string>({
  label = 'Sort',
  ariaLabel = 'Sort items',
  triggerAriaLabel = 'Sort order',
  value,
  options,
  onValueChange,
}: CatalogSortControlProps<TMode>) {
  const selectedOption = options.find((option) => option.value === value)
  const triggerLabel = selectedOption ? resolvePickerSortTriggerLabel(selectedOption) : undefined

  return (
    <div className={catalogPickerSortFilterClasses} role="group" aria-label={ariaLabel}>
      <Text as="span" className={catalogPickerSortLabelClasses}>
        {label}
      </Text>
      <Select value={value} onValueChange={(next) => onValueChange(next as TMode)}>
        <SelectTrigger
          size="sm"
          className="w-auto shrink-0 min-w-[4.5rem]"
          aria-label={triggerAriaLabel}
        >
          <SelectValue>{triggerLabel}</SelectValue>
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
