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
  cardSurfaceVariants,
  resolveOptionCardSurfaceDensity,
  type CardElevation,
} from './card.variants'
import {
  optionCardEmbeddedSlotClassName,
  UI_SELECTION_OPTION_CARD_BODY_CLASS,
  type OptionCardEmbeddedSlotTone,
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
  /** Shell depth — defaults raised so chooser cards keep depth after tone/elevation split. */
  elevation?: CardElevation
  headerStartSlot?: ReactNode
  /** Renders a density-scaled eyebrow in the header row (preferred over raw `Eyebrow` in `headerStartSlot`). */
  headerEyebrow?: string
  headerEyebrowSize?: EyebrowVariantProps['size']
  headerEndSlot?: ReactNode
  label: string
  /** Inline content after the title. Callers pass `SelectionOptionCardTitleMeta`. */
  titleAdornment?: ReactNode
  description?: string
  summaryLines?: string[]
  /** Rich summary under the description, in normal flow (not the equal-height badge row). */
  summaryContent?: ReactNode
  /**
   * Nested region below the description. The card owns the chrome via
   * `optionCardEmbeddedSlotClassName`.
   */
  embedded?: ReactNode
  embeddedTone?: OptionCardEmbeddedSlotTone
  className?: string
}

function SelectionOptionCardHeaderRow({
  density = 'comfortable',
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
    <div className="ui-selection-option-card__header-row">
      {startSlot ? <div className="min-w-0">{startSlot}</div> : null}
      {headerEndSlot ? (
        <div className="ui-selection-option-card__header-action-slot">{headerEndSlot}</div>
      ) : null}
    </div>
  )
}

export type SelectionOptionCardHeaderActionProps = {
  label: string
  onClick: () => void
  ariaLabel?: string
  /** Match the parent card density — compact cards use the xs control-action label size. */
  density?: SelectionOptionCardDensity
}

/** Compact link action for the selection card header row. */
export function SelectionOptionCardHeaderAction({
  label,
  onClick,
  ariaLabel,
  density = 'comfortable',
}: SelectionOptionCardHeaderActionProps) {
  const buttonSize = density === 'compact' ? 'xs' : 'sm'

  return (
    <Button
      type="button"
      variant="text"
      size={buttonSize}
      density="compact"
      className={cn('shrink-0', density === 'compact' && 'text-control-action-xs')}
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
  density = 'comfortable',
  elevation = 'raised',
  headerStartSlot,
  headerEyebrow,
  headerEyebrowSize,
  headerEndSlot,
  label,
  titleAdornment,
  description,
  summaryLines,
  summaryContent,
  embedded,
  embeddedTone = 'divider',
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
      className={cn(
        cardSurfaceVariants({
          tone: 'strong',
          elevation,
          density: resolveOptionCardSurfaceDensity(density),
          selected,
          disabled,
        }),
        className,
      )}
      aria-disabled={disabled || undefined}
    >
      <div className={UI_SELECTION_OPTION_CARD_BODY_CLASS}>
        <SelectionOptionCardAnatomy
          density={density}
          headerRow={headerRow}
          label={label}
          titleAdornment={titleAdornment}
          description={description}
          summaryLines={summaryLines}
          summaryContent={summaryContent}
          embedded={
            embedded ? (
              <div className={optionCardEmbeddedSlotClassName(embeddedTone)}>{embedded}</div>
            ) : undefined
          }
          useSummaryTitle
        />
      </div>
    </Comp>
  )
}
