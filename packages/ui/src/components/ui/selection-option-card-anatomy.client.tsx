'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { textVariants } from './text.variants'
import {
  optionCardBodyVariants,
  optionCardDescriptionVariants,
  optionCardPrimaryCopyStackVariants,
  optionCardSummaryLinesVariants,
  optionCardSummaryTitleVariants,
  optionCardSummaryVariants,
  optionCardTitleRowVariants,
  optionCardTitleVariants,
  selectionOptionCardAnatomyBodyVariants,
  selectionOptionCardAnatomyRootVariants,
} from './selection-option-card.variants'

export const SELECTION_OPTION_CARD_SUMMARY_SEPARATOR = ' · '

export type SelectionOptionCardDensity = 'default' | 'compact'

export type SelectionOptionCardAnatomyProps = {
  density?: SelectionOptionCardDensity
  headerRow?: ReactNode
  leadingControl?: ReactNode
  label: string
  titleAdornment?: ReactNode
  titleEndSlot?: ReactNode
  description?: string
  summaryItems?: string[]
  summaryLines?: string[]
  embedded?: ReactNode
  footer?: ReactNode
  /** Merged onto the option title label. */
  titleClassName?: string
  controlPosition?: 'left' | 'right'
  /** When true, use summary title scale instead of chooser title scale. */
  useSummaryTitle?: boolean
}

function SelectionOptionCardSummaryLines({
  summaryLines,
  density = 'default',
}: {
  summaryLines: string[]
  density?: SelectionOptionCardDensity
}) {
  return (
    <div className={optionCardSummaryLinesVariants()}>
      {summaryLines.map((line) => (
        <span key={line} className={optionCardSummaryVariants({ density })}>
          {line}
        </span>
      ))}
    </div>
  )
}

function SelectionOptionCardSecondaryContent({
  description,
  summaryText,
  summaryLines,
  density = 'default',
}: {
  description?: string
  summaryText?: string
  summaryLines?: string[]
  density?: SelectionOptionCardDensity
}) {
  return (
    <>
      {description ? (
        <span className={optionCardDescriptionVariants({ density })}>{description}</span>
      ) : null}
      {summaryText ? (
        <span className={optionCardSummaryVariants({ density })}>{summaryText}</span>
      ) : null}
      {summaryLines && summaryLines.length > 0 ? (
        <SelectionOptionCardSummaryLines summaryLines={summaryLines} density={density} />
      ) : null}
    </>
  )
}

export function SelectionOptionCardAnatomy({
  density = 'default',
  headerRow,
  leadingControl,
  label,
  titleAdornment,
  titleEndSlot,
  description,
  summaryItems,
  summaryLines,
  embedded,
  footer,
  titleClassName,
  controlPosition = 'left',
  useSummaryTitle = false,
}: SelectionOptionCardAnatomyProps) {
  const summaryText =
    summaryItems && summaryItems.length > 0
      ? summaryItems.join(SELECTION_OPTION_CARD_SUMMARY_SEPARATOR)
      : undefined
  const titleVariants = useSummaryTitle ? optionCardSummaryTitleVariants : optionCardTitleVariants

  const TitleElement = useSummaryTitle ? 'h3' : 'span'
  const titleRow = (
    <div className={optionCardTitleRowVariants()}>
      <TitleElement className={cn(titleVariants({ density }), titleClassName)}>
        {label}
      </TitleElement>
      {titleAdornment}
    </div>
  )

  const primaryCopy = (
    <div className={optionCardPrimaryCopyStackVariants({ density })}>
      {titleEndSlot ? (
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0 flex-1">{titleRow}</div>
          <div className="shrink-0 self-center">{titleEndSlot}</div>
        </div>
      ) : (
        titleRow
      )}
      <SelectionOptionCardSecondaryContent
        description={description}
        summaryText={summaryText}
        summaryLines={summaryLines}
        density={density}
      />
    </div>
  )

  const body = (
    <div
      className={
        useSummaryTitle
          ? selectionOptionCardAnatomyBodyVariants()
          : optionCardBodyVariants({ density })
      }
    >
      {headerRow}
      {primaryCopy}
      {embedded}
      {footer}
    </div>
  )

  if (!leadingControl) {
    return body
  }

  return (
    <div
      className={selectionOptionCardAnatomyRootVariants({
        controlPosition,
        density,
      })}
    >
      {leadingControl}
      {body}
    </div>
  )
}

/** Inline muted text immediately after the card title (e.g. dependent-choice status). */
export function SelectionOptionCardTitleMeta({ children }: { children: string }) {
  return (
    <span className={cn(textVariants({ variant: 'small' }), 'text-muted-foreground')}>
      {children}
    </span>
  )
}
