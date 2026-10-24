'use client'

import { SelectItem } from './select.client'
import type { FieldOption } from '../../form/field-config'

export function SelectOptionItem({
  option,
  itemValue = option.value,
}: {
  option: FieldOption
  itemValue?: string
}) {
  const reason = option.disabled ? option.disabledReason : undefined

  return (
    <SelectItem value={itemValue} disabled={option.disabled}>
      {reason ? (
        <span className="flex w-full items-center justify-between gap-3">
          <span>{option.label}</span>
          <span className="text-style-caption">{reason}</span>
        </span>
      ) : (
        option.label
      )}
    </SelectItem>
  )
}
