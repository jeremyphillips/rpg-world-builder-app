'use client'

import { Check } from 'lucide-react'

import { comboboxOptionVariants } from './combobox-field.variants'

interface ListboxOptionButtonProps {
  option: { label: string; value: string; description?: string }
  isSelected: boolean
  onSelect: () => void
  optionId?: string
  isHighlighted?: boolean
  isDisabled?: boolean
  onHighlight?: () => void
}

/** Shared listbox option row used by combobox and input-select fields. */
export function ListboxOptionButton({
  option,
  isSelected,
  onSelect,
  optionId,
  isHighlighted,
  isDisabled,
  onHighlight,
}: ListboxOptionButtonProps) {
  return (
    <button
      id={optionId}
      type="button"
      role="option"
      aria-selected={isSelected}
      data-active={isHighlighted}
      data-disabled={isDisabled}
      disabled={isDisabled}
      className={comboboxOptionVariants()}
      onMouseEnter={onHighlight}
      onClick={onSelect}
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate">{option.label}</span>
        {option.description ? (
          <span className="truncate text-xs text-muted-foreground">{option.description}</span>
        ) : null}
      </span>
      {isSelected ? (
        <Check className="size-4 shrink-0" aria-hidden />
      ) : (
        <span className="size-4 shrink-0" aria-hidden />
      )}
    </button>
  )
}
