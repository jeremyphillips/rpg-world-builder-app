'use client'

import { Checkbox, Text } from '@rpg/ui'

import {
  catalogPickerCheckboxFilterClasses,
  catalogPickerCheckboxHiddenCountClasses,
  catalogPickerCheckboxLabelClasses,
} from './catalog-picker-filter-toolbar.variants'

export type CatalogPickerFilterCheckboxProps = {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  hiddenCount?: number
}

export function CatalogPickerFilterCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
  hiddenCount,
}: CatalogPickerFilterCheckboxProps) {
  return (
    <div className={catalogPickerCheckboxFilterClasses}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <Text as="label" htmlFor={id} className={catalogPickerCheckboxLabelClasses}>
        {label}
      </Text>
      {checked && hiddenCount !== undefined && hiddenCount > 0 ? (
        <Text as="span" className={catalogPickerCheckboxHiddenCountClasses}>
          {hiddenCount} hidden
        </Text>
      ) : null}
    </div>
  )
}
