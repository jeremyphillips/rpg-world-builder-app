'use client'

import type { ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { SelectionOptionCardAnatomy } from './selection-option-card-anatomy.client'
import {
  selectionOptionCardBodyVariants,
  selectionOptionCardHeaderActionClasses,
  selectionOptionCardHeaderActionSlotVariants,
  selectionOptionCardHeaderRowVariants,
  selectionOptionCardShellVariants,
} from './selection-option-card.variants'

export type SelectionOptionCardProps = {
  selected: boolean
  disabled?: boolean
  asChild?: boolean
  headerStartSlot?: ReactNode
  headerEndSlot?: ReactNode
  label: string
  description?: string
  summaryLines?: string[]
  className?: string
}

function SelectionOptionCardHeaderRow({
  headerStartSlot,
  headerEndSlot,
}: Pick<SelectionOptionCardProps, 'headerStartSlot' | 'headerEndSlot'>) {
  if (!headerStartSlot && !headerEndSlot) {
    return null
  }

  return (
    <div className={selectionOptionCardHeaderRowVariants()}>
      {headerStartSlot ? <div className="min-w-0">{headerStartSlot}</div> : null}
      {headerEndSlot ? (
        <div className={selectionOptionCardHeaderActionSlotVariants()}>{headerEndSlot}</div>
      ) : null}
    </div>
  )
}

export type SelectionOptionCardHeaderActionProps = {
  label: string
  onClick: () => void
  ariaLabel?: string
}

/** Compact link action for the selection card header row. */
export function SelectionOptionCardHeaderAction({
  label,
  onClick,
  ariaLabel,
}: SelectionOptionCardHeaderActionProps) {
  return (
    <Button
      type="button"
      variant="text"
      size="sm"
      density="compact"
      className={selectionOptionCardHeaderActionClasses}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

export function SelectionOptionCard({
  selected,
  disabled = false,
  asChild = false,
  headerStartSlot,
  headerEndSlot,
  label,
  description,
  summaryLines,
  className,
}: SelectionOptionCardProps) {
  const Comp = asChild ? Slot : 'div'
  const headerRow =
    headerStartSlot || headerEndSlot ? (
      <SelectionOptionCardHeaderRow
        headerStartSlot={headerStartSlot}
        headerEndSlot={headerEndSlot}
      />
    ) : undefined

  return (
    <Comp
      className={cn(selectionOptionCardShellVariants({ selected, disabled }), className)}
      aria-disabled={disabled || undefined}
    >
      <div className={selectionOptionCardBodyVariants()}>
        <SelectionOptionCardAnatomy
          headerRow={headerRow}
          label={label}
          description={description}
          summaryLines={summaryLines}
          useSummaryTitle
        />
      </div>
    </Comp>
  )
}
