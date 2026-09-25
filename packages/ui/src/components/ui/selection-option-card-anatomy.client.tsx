'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { textVariants } from './text.variants'
import {
  optionCardBodyVariants,
  optionCardDescriptionClampVariants,
  optionCardDescriptionVariants,
  optionCardPrimaryCopyStackVariants,
  optionCardSummaryLinesVariants,
  optionCardSummaryTitleVariants,
  optionCardSummaryVariants,
  optionCardTitleClampVariants,
  optionCardTitleRowVariants,
  optionCardTitleVariants,
  selectionOptionCardAnatomyBodyVariants,
  optionCardSecondaryCopyStackVariants,
  optionCardSummaryBadgeRowVariants,
  optionCardTitleLineVariants,
  selectionOptionCardAnatomyRootVariants,
} from './selection-option-card.variants'

export type SelectionOptionCardCopyWidth = 'fill' | 'content'

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
  /** Third-row badge below the description (e.g. spellcasting progression). */
  summaryBadge?: ReactNode
  /** Reserve badge-row height even when {@link summaryBadge} is absent. */
  reserveSummaryBadgeRow?: boolean
  /** Clamp title and description for equal-height card grids. */
  clampDescription?: boolean
  /** When `content`, metadata under the title shrink-wraps instead of filling the content column. */
  copyWidth?: SelectionOptionCardCopyWidth
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
  clampDescription = false,
}: {
  description?: string
  summaryText?: string
  summaryLines?: string[]
  density?: SelectionOptionCardDensity
  clampDescription?: boolean
}) {
  return (
    <>
      {description ? (
        <span
          className={cn(
            optionCardDescriptionVariants({ density }),
            clampDescription && optionCardDescriptionClampVariants(),
          )}
        >
          {description}
        </span>
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

function SelectionOptionCardTitleRow({
  label,
  titleAdornment,
  titleClassName,
  density,
  useSummaryTitle,
  clampDescription,
}: {
  label: string
  titleAdornment?: ReactNode
  titleClassName?: string
  density: SelectionOptionCardDensity
  useSummaryTitle: boolean
  clampDescription: boolean
}) {
  const titleVariants = useSummaryTitle ? optionCardSummaryTitleVariants : optionCardTitleVariants
  const TitleElement = useSummaryTitle ? 'h3' : 'span'

  return (
    <div className={optionCardTitleRowVariants()}>
      <TitleElement
        className={cn(
          titleVariants({ density }),
          clampDescription && optionCardTitleClampVariants(),
          titleClassName,
        )}
      >
        {label}
      </TitleElement>
      {titleAdornment}
    </div>
  )
}

function SelectionOptionCardPrimaryCopy({
  density,
  titleEndSlot,
  titleRow,
  description,
  summaryText,
  summaryLines,
  clampDescription,
  copyWidth,
  summaryBadge,
  reserveSummaryBadgeRow,
}: {
  density: SelectionOptionCardDensity
  titleEndSlot?: ReactNode
  titleRow: ReactNode
  description?: string
  summaryText?: string
  summaryLines?: string[]
  clampDescription: boolean
  copyWidth: SelectionOptionCardCopyWidth
  summaryBadge?: ReactNode
  reserveSummaryBadgeRow: boolean
}) {
  const showSummaryBadgeRow = reserveSummaryBadgeRow || summaryBadge != null

  return (
    <div
      className={cn(
        optionCardPrimaryCopyStackVariants({ density }),
        'min-w-0 w-full',
        showSummaryBadgeRow && 'flex min-h-0 flex-1 flex-col',
      )}
    >
      <div className={cn(showSummaryBadgeRow && 'flex min-h-0 flex-1 flex-col')}>
        {titleEndSlot ? (
          <div className={optionCardTitleLineVariants()}>
            <div className="min-w-0 shrink">{titleRow}</div>
            <div className="shrink-0">{titleEndSlot}</div>
          </div>
        ) : (
          titleRow
        )}
        <div className={optionCardSecondaryCopyStackVariants({ density, copyWidth })}>
          <SelectionOptionCardSecondaryContent
            description={description}
            summaryText={summaryText}
            summaryLines={summaryLines}
            density={density}
            clampDescription={clampDescription}
          />
        </div>
      </div>
      {showSummaryBadgeRow ? (
        <div className={optionCardSummaryBadgeRowVariants()}>{summaryBadge}</div>
      ) : null}
    </div>
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
  summaryBadge,
  reserveSummaryBadgeRow = false,
  clampDescription = false,
  copyWidth = 'fill',
}: SelectionOptionCardAnatomyProps) {
  const summaryText =
    summaryItems && summaryItems.length > 0
      ? summaryItems.join(SELECTION_OPTION_CARD_SUMMARY_SEPARATOR)
      : undefined
  const titleRow = (
    <SelectionOptionCardTitleRow
      label={label}
      titleAdornment={titleAdornment}
      titleClassName={titleClassName}
      density={density}
      useSummaryTitle={useSummaryTitle}
      clampDescription={clampDescription}
    />
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
      <SelectionOptionCardPrimaryCopy
        density={density}
        titleEndSlot={titleEndSlot}
        titleRow={titleRow}
        description={description}
        summaryText={summaryText}
        summaryLines={summaryLines}
        clampDescription={clampDescription}
        copyWidth={copyWidth}
        summaryBadge={summaryBadge}
        reserveSummaryBadgeRow={reserveSummaryBadgeRow}
      />
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
