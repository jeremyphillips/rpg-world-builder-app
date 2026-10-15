'use client'

import { SharedFilterSelect } from '../../../filters/shared-filter-select.client'
import type { FieldOption } from '../../field-config'

export interface ComboboxFilterSelectProps {
  ariaLabel: string
  options: FieldOption[]
  value: string
  onValueChange: (value: string) => void
}

/**
 * Legacy single-dimension combobox filter — options include the All row.
 * @deprecated Prefer `ComboboxFilterToolbar` + `filterSelects`.
 */
export function ComboboxFilterSelect({
  ariaLabel,
  options,
  value,
  onValueChange,
}: ComboboxFilterSelectProps) {
  return (
    <SharedFilterSelect
      ariaLabel={ariaLabel}
      options={options}
      selectValue={value}
      onSelectValueChange={onValueChange}
      showAllOption={false}
    />
  )
}
