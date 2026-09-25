'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { RadioGroup } from './radio-group.client'
import {
  RadioOptionCard,
  RadioOptionCardDetailsAction,
  RadioOptionCardTitleAdornment,
} from './radio-option-card.client'
import type { SelectionOptionCardCopyWidth } from './selection-option-card-anatomy.client'
import { radioCardGroupGapVariants } from './radio-card.variants'

export function resolveRadioCardDetailsAriaLabel(label: string): string {
  return `View ${label} details`
}

/** Radix RadioGroup skips onValueChange when the current option is clicked again. */
export function createRadioCardReselectClickHandler(
  optionValue: string,
  selectedValue: string | undefined,
  onValueChange?: (value: string) => void,
  disabled?: boolean,
): React.MouseEventHandler<HTMLButtonElement> | undefined {
  if (!onValueChange || disabled) {
    return undefined
  }

  return () => {
    if (selectedValue === optionValue) {
      onValueChange(optionValue)
    }
  }
}

export type RadioCardDensity = 'default' | 'compact'

export type RadioCardVariant = 'card' | 'row'

export type RadioCardVisualControl = 'radio' | 'icon'

export type RadioCardEmbeddedSlotTone = 'divider' | 'panel'

export type RadioCardColumns = 'one' | 'two' | 'three'

export type RadioCardSummaryBadge = {
  label: string
  tooltip?: string
}

export interface RadioCardOption {
  label: string
  value: string
  disabled?: boolean
  /** Leading visual when the group uses visualControl="icon". */
  icon?: React.ReactNode
  description?: string
  /** Optional badge rendered inline with the title (e.g. "Recommended"). */
  badge?: string
  /** Inline muted text immediately after the title (e.g. "Heritage required"). */
  titleMeta?: string
  /** Compact density: trait names or other summary chips rendered inline. */
  summaryItems?: string[]
  /** Stacked muted lines below the title row (e.g. level-grouped grant summaries). */
  summaryLines?: string[]
  /** Full-bleed image region above the card body. */
  media?: React.ReactNode
  /** Third-row neutral badge (e.g. spellcasting progression). */
  summaryBadge?: RadioCardSummaryBadge
  /** Rendered inside the card shell when this option is selected (e.g. dependent-choice flow). */
  embeddedContent?: React.ReactNode
  /** Visual treatment for the embedded region below the primary card row. */
  embeddedSlotTone?: RadioCardEmbeddedSlotTone
  /** Always-visible region below the primary row inside the shell (e.g. validation reasons). */
  footerContent?: React.ReactNode
  onDetails?: () => void
  /** Overrides the default `View {label} details` accessible name for the info action. */
  detailsAriaLabel?: string
}

export interface RadioCardProps extends React.ComponentPropsWithoutRef<typeof RadioGroup> {
  options: RadioCardOption[]
  /** Prefix for generated option ids (used with `htmlFor` when embedding items separately). */
  idPrefix?: string
  variant?: RadioCardVariant
  density?: RadioCardDensity
  /**
   * Horizontal placement of the decorative radio control within each card.
   * Ignored when visualControl="icon".
   */
  controlPosition?: 'left' | 'right'
  /** Leading control presentation. Default 'radio' preserves existing consumers. */
  visualControl?: RadioCardVisualControl
  /** Responsive column count for card-variant groups. Default 'one'. */
  columns?: RadioCardColumns
  /** Reserve third-row badge height on every card for equal-height grids. */
  reserveSummaryBadgeRow?: boolean
  /** Clamp title and description for equal-height card grids. */
  clampDescription?: boolean
  /** When `content`, metadata under the title shrink-wraps instead of filling the content column. */
  copyWidth?: SelectionOptionCardCopyWidth
}

/**
 * Card-style single-select built on Radix `RadioGroup`. Each option renders a
 * label, optional description, and optional summary content.
 */
function RadioCard({
  className,
  options,
  idPrefix = 'radio-card',
  variant = 'card',
  density = 'default',
  controlPosition = 'left',
  visualControl = 'radio',
  columns = 'one',
  reserveSummaryBadgeRow = false,
  clampDescription = false,
  copyWidth = 'fill',
  value,
  onValueChange,
  ...props
}: RadioCardProps) {
  const selectedValue = value ?? undefined

  return (
    <RadioGroup
      className={cn(radioCardGroupGapVariants({ variant, density, columns }), className)}
      value={value}
      onValueChange={onValueChange}
      {...props}
    >
      {options.map((option) => {
        const selected = selectedValue === option.value
        const titleAdornment = (
          <RadioOptionCardTitleAdornment badge={option.badge} titleMeta={option.titleMeta} />
        )
        const titleEndSlot = option.onDetails ? (
          <RadioOptionCardDetailsAction
            ariaLabel={option.detailsAriaLabel ?? resolveRadioCardDetailsAriaLabel(option.label)}
            onDetails={option.onDetails}
          />
        ) : undefined

        return (
          <RadioOptionCard
            key={option.value}
            id={`${idPrefix}-${option.value}`}
            value={option.value}
            disabled={option.disabled}
            label={option.label}
            description={option.description}
            summaryItems={option.summaryItems}
            summaryLines={option.summaryLines}
            density={density}
            variant={variant}
            controlPosition={controlPosition}
            visualControl={visualControl}
            icon={option.icon}
            titleAdornment={titleAdornment}
            titleEndSlot={titleEndSlot}
            media={option.media}
            summaryBadge={option.summaryBadge}
            reserveSummaryBadgeRow={reserveSummaryBadgeRow}
            clampDescription={clampDescription}
            copyWidth={copyWidth}
            embedded={option.embeddedContent}
            footer={option.footerContent}
            embeddedTone={option.embeddedSlotTone}
            shellSelected={selected}
            showEmbedded={selected}
            onClick={createRadioCardReselectClickHandler(
              option.value,
              selectedValue,
              onValueChange,
              option.disabled,
            )}
          />
        )
      })}
    </RadioGroup>
  )
}

export { RadioCard }
export { radioCardVariants } from './radio-card.variants'
