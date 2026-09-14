'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select.client'
import type { FieldOption } from '../../field-config'

export interface ComboboxFilterSelectProps {
  ariaLabel: string
  options: FieldOption[]
  value: string
  onValueChange: (value: string) => void
}

/** Category filter select rendered in a combobox panel toolbar filter row. */
export function ComboboxFilterSelect({
  ariaLabel,
  options,
  value,
  onValueChange,
}: ComboboxFilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger size="sm" aria-label={ariaLabel}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
