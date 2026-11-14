'use client'

import './select-option-item.css'

import { SelectItem } from './select.client'
import type { FieldOption } from '../../form/field-config/field-options'
import { SelectOptionRowContent } from './select-option-row-content.client'

export function SelectOptionItem({
  option,
  itemValue = option.value,
}: {
  option: FieldOption
  itemValue?: string
}) {
  const trailingColumn =
    option.disabled && option.disabledReason ? true : Boolean(option.trailing?.text)

  return (
    <SelectItem value={itemValue} disabled={option.disabled} textValue={option.label}>
      {trailingColumn ? (
        <SelectOptionRowContent
          label={option.label}
          trailing={option.trailing}
          disabled={option.disabled}
          disabledReason={option.disabledReason}
          mode="item"
        />
      ) : (
        option.label
      )}
    </SelectItem>
  )
}
