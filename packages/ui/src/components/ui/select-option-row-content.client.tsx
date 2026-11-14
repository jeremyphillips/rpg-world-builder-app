'use client'

import './select-option-item.css'

import { cn } from '../../lib/utils'
import type { SelectOptionTrailing } from '../../form/field-config/field-options'
import {
  resolveSelectOptionTrailingColumn,
  selectOptionTrailingClassName,
} from './select-option-row-content.lib'

export type SelectOptionRowContentProps = {
  label: string
  trailing?: SelectOptionTrailing
  disabled?: boolean
  disabledReason?: string
  /** Trigger values truncate the primary label; dropdown rows may wrap. */
  mode?: 'item' | 'trigger'
}

export function SelectOptionRowContent({
  label,
  trailing,
  disabled,
  disabledReason,
  mode = 'item',
}: SelectOptionRowContentProps) {
  const trailingColumn = resolveSelectOptionTrailingColumn({ disabled, disabledReason, trailing })
  if (!trailingColumn) {
    return mode === 'trigger' ? (
      <span className="ui-select-option-row__label ui-select-option-row__label--truncate">
        {label}
      </span>
    ) : (
      label
    )
  }

  return (
    <span
      className={cn(
        'ui-select-option-row',
        mode === 'item' && 'ui-select-option-row--item',
        mode === 'trigger' && 'ui-select-option-row--trigger',
      )}
    >
      <span
        className={cn(
          'ui-select-option-row__label',
          (mode === 'trigger' || mode === 'item') && 'ui-select-option-row__label--truncate',
        )}
      >
        {label}
      </span>
      <span className={selectOptionTrailingClassName(trailingColumn.variant)}>
        {trailingColumn.text}
      </span>
    </span>
  )
}
