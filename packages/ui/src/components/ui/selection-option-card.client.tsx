'use client'

import type { ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import {
  SelectionOptionCardAnatomy,
  SelectionOptionCardHeaderEyebrow,
  type SelectionOptionCardDensity,
} from './selection-option-card-anatomy.client'
import type { EyebrowVariantProps } from './eyebrow.variants'
import {
  selectionOptionCardBodyVariants,
  selectionOptionCardHeaderActionClasses,
  selectionOptionCardHeaderActionSlotVariants,
  selectionOptionCardHeaderRowVariants,
  selectionOptionCardShellVariants,
} from './selection-option-card.variants'

export type { SelectionOptionCardDensity } from './selection-option-card-anatomy.client'

/**
 * Static selected option card — same density scale as radio chooser cards.
 *
 * **Visual parity vs structural parity:** density controls typography and rhythm
 * (title, description, summary, eyebrow). Selected cards may omit the radio
 * control, use summary-shell padding, expose header actions, and condense layout
 * without changing density scale when transitioning from chooser → selected.
 */
export type SelectionOptionCardProps = {
  selected: boolean
  disabled?: boolean
  asChild?: boolean
  density?: SelectionOptionCardDensity
  headerStartSlot?: ReactNode
  /** Renders a density-scaled eyebrow in the header row (preferred over raw `Eyebrow` in `headerStartSlot`). */
  headerEyebrow?: string
  headerEyebrowSize?: EyebrowVariantProps['size']
  headerEndSlot?: ReactNode
  label: string
  description?: string
  summaryLines?: string[]
  className?: string
}

function SelectionOptionCardHeaderRow({
  density = 'default',
  headerEyebrow,
  headerEyebrowSize,
  headerStartSlot,
  headerEndSlot,
}: Pick<
  SelectionOptionCardProps,
  'density' | 'headerEyebrow' | 'headerEyebrowSize' | 'headerStartSlot' | 'headerEndSlot'
>) {
  const startSlot = headerEyebrow ? (
    <SelectionOptionCardHeaderEyebrow density={density} size={headerEyebrowSize}>
      {headerEyebrow}
    </SelectionOptionCardHeaderEyebrow>
  ) : (
    headerStartSlot
  )

  if (!startSlot && !headerEndSlot) {
    return null
  }

  return (
    <div className={selectionOptionCardHeaderRowVariants()}>
      {startSlot ? <div className="min-w-0">{startSlot}</div> : null}
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
  density = 'default',
  headerStartSlot,
  headerEyebrow,
  headerEyebrowSize,
  headerEndSlot,
  label,
  description,
  summaryLines,
  className,
}: SelectionOptionCardProps) {
  const Comp = asChild ? Slot : 'div'
  const headerRow =
    headerStartSlot || headerEyebrow || headerEndSlot ? (
      <SelectionOptionCardHeaderRow
        density={density}
        headerEyebrow={headerEyebrow}
        headerEyebrowSize={headerEyebrowSize}
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
          density={density}
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
