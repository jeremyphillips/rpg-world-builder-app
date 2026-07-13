'use client'

import type { ReactNode } from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Text } from '@rpg/ui'

import {
  catalogPickerFilterGroupClasses,
  catalogPickerFilterLabelClasses,
} from './catalog-picker-filter-toolbar.variants'

export type CatalogPickerFilterGroupProps = {
  label: string
  ariaLabel: string
  value: string
  onValueChange: (value: string) => void
  triggerAriaLabel: string
  children: ReactNode
}

export function CatalogPickerFilterGroup({
  label,
  ariaLabel,
  value,
  onValueChange,
  triggerAriaLabel,
  children,
}: CatalogPickerFilterGroupProps) {
  return (
    <div className={catalogPickerFilterGroupClasses} role="group" aria-label={ariaLabel}>
      <Text as="span" className={catalogPickerFilterLabelClasses}>
        {label}
      </Text>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger size="sm" aria-label={triggerAriaLabel}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  )
}

export { SelectItem as CatalogPickerFilterSelectItem }
