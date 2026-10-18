'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { RadioGroup } from './radio-group.client'
import { RadioOptionCard, RadioOptionCardTitleAdornment } from './radio-option-card.client'
import type {
  SelectionOptionCardCopyWidth,
  SelectionOptionCardDensity,
} from './selection-option-card-anatomy.client'
import type { CardSurfaceTone } from './card.variants'
import { radioCardGroupGapVariants } from './radio-card.variants'

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

export type RadioCardVariant = 'card' | 'row'

export type RadioCardVisualControl = 'radio' | 'icon'

export type RadioCardEmbeddedSlotTone = 'divider' | 'panel' | 'plain'

export type RadioCardColumns = 'one' | 'two' | 'three'

export type RadioCardSummaryBadge = {
  label: string
  tooltip?: string
}

type RadioCardOptionBase = {
  label: string
  value: string
  disabled?: boolean
  icon?: React.ReactNode
  description?: string
  badge?: string
  titleMeta?: string
  summaryItems?: string[]
  summaryLines?: string[]
  summaryContent?: React.ReactNode
  media?: React.ReactNode
  summaryBadge?: RadioCardSummaryBadge
  embeddedContent?: React.ReactNode
  embeddedSlotTone?: RadioCardEmbeddedSlotTone
  footerContent?: React.ReactNode
}

type RadioCardOptionTrailing =
  | { details?: undefined; onDetails?: undefined }
  | { details: React.ReactNode; onDetails?: never }
  | { onDetails: () => void; details?: never }

export type RadioCardOption = RadioCardOptionBase & RadioCardOptionTrailing

export interface RadioCardProps extends React.ComponentPropsWithoutRef<typeof RadioGroup> {
  options: RadioCardOption[]
  idPrefix?: string
  variant?: RadioCardVariant
  density?: SelectionOptionCardDensity
  visualControl?: RadioCardVisualControl
  columns?: RadioCardColumns
  copyWidth?: SelectionOptionCardCopyWidth
  /** Card chrome ladder; defaults to strong. Pass quiet in drawer hosts. */
  tone?: CardSurfaceTone
}

function RadioCard({
  className,
  options,
  idPrefix = 'radio-card',
  variant = 'card',
  density = 'default',
  visualControl = 'radio',
  columns = 'one',
  copyWidth = 'fill',
  tone = 'strong',
  value,
  onValueChange,
  ...props
}: RadioCardProps) {
  const selectedValue = value ?? undefined
  const reserveSummaryBadgeRow = options.some((option) => option.summaryBadge != null)

  return (
    <RadioGroup
      className={cn(radioCardGroupGapVariants({ variant, density, columns }), className)}
      value={value}
      onValueChange={onValueChange}
      {...props}
    >
      {options.map((option) => {
        const titleAdornment = (
          <RadioOptionCardTitleAdornment badge={option.badge} titleMeta={option.titleMeta} />
        )

        return (
          <RadioOptionCard
            key={option.value}
            id={`${idPrefix}-${option.value}`}
            value={option.value}
            disabled={option.disabled}
            reserveSummaryBadgeRow={reserveSummaryBadgeRow}
            label={option.label}
            description={option.description}
            summaryItems={option.summaryItems}
            summaryLines={option.summaryLines}
            summaryContent={option.summaryContent}
            density={density}
            tone={tone}
            variant={variant}
            visualControl={visualControl}
            icon={option.icon}
            titleAdornment={titleAdornment}
            media={option.media}
            summaryBadge={option.summaryBadge}
            copyWidth={copyWidth}
            embedded={option.embeddedContent}
            footer={option.footerContent}
            embeddedTone={option.embeddedSlotTone}
            details={'details' in option ? option.details : undefined}
            onDetails={'onDetails' in option ? option.onDetails : undefined}
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
