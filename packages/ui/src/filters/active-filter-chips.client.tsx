'use client'

import { Chip } from '../components/ui/chip.client'
import { cn } from '../lib/utils'
import type { ActiveFilterChip } from './filter-active-chips.lib'

export type ActiveFilterChipsProps = {
  chips: readonly ActiveFilterChip[]
  onClear: (fieldId: string) => void
  onClearAll?: () => void
  clearAllLabel?: string
  clearChipLabel?: (chip: ActiveFilterChip) => string
  className?: string
  disabled?: boolean
}

function formatChipLabel(chip: ActiveFilterChip): string {
  if (!chip.valueLabel) return chip.label
  return `${chip.label}: ${chip.valueLabel}`
}

export function ActiveFilterChips({
  chips,
  onClear,
  onClearAll,
  clearAllLabel = 'Clear all',
  clearChipLabel = (chip) => `Clear ${chip.label.toLowerCase()} filter`,
  className,
  disabled = false,
}: ActiveFilterChipsProps) {
  if (chips.length === 0) return null

  const showClearAll = chips.length >= 2 && onClearAll

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {chips.map((chip) => (
        <Chip
          key={chip.fieldId}
          mode="removable"
          size="md"
          disabled={disabled}
          removeLabel={clearChipLabel(chip)}
          onRemove={() => onClear(chip.fieldId)}
        >
          {formatChipLabel(chip)}
        </Chip>
      ))}
      {showClearAll ? (
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          disabled={disabled}
          onClick={onClearAll}
        >
          {clearAllLabel}
        </button>
      ) : null}
    </div>
  )
}
