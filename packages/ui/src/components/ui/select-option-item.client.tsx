'use client'

import { SelectItem } from './select.client'
import {
  selectOptionItemContentVariants,
  selectOptionItemReasonVariants,
} from './select-option-item.variants'
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
        <span className={selectOptionItemContentVariants()}>
          <span>{option.label}</span>
          <span className={selectOptionItemReasonVariants()}>{reason}</span>
        </span>
      ) : (
        option.label
      )}
    </SelectItem>
  )
}
