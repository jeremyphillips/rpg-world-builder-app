'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Eyebrow } from './eyebrow'
import type { EyebrowVariantProps } from './eyebrow.variants'
import { identityInsetRowVariants } from './identity-frame.variants'
import { textVariants } from './text.variants'
import { selectionOptionCardAnatomyClassName } from './selection-option-card.lib'

export type SelectionOptionCardCopyWidth = 'fill' | 'content'

import { joinInlineMetadata } from '@rpg/contracts/primitives'

export type SelectionOptionCardDensity = 'comfortable' | 'compact'

const OPTION_CARD_SUPPORTING_CLASS = 'ui-copy-supporting text-muted-foreground'

/** Default card eyebrow is `sm`; compact density steps down one size. */
export function resolveSelectionOptionCardEyebrowSize(
  density: SelectionOptionCardDensity,
): NonNullable<EyebrowVariantProps['size']> {
  return density === 'compact' ? 'xs' : 'sm'
}

export type SelectionOptionCardHeaderEyebrowProps = {
  density?: SelectionOptionCardDensity
  /** Overrides density-derived eyebrow size when a surface needs an exception. */
  size?: EyebrowVariantProps['size']
  children: string
}

export function SelectionOptionCardHeaderEyebrow({
  density = 'comfortable',
  size,
  children,
}: SelectionOptionCardHeaderEyebrowProps) {
  return <Eyebrow size={size ?? resolveSelectionOptionCardEyebrowSize(density)}>{children}</Eyebrow>
}

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
  /** Rich summary under the description, before string summary lines. */
  summaryContent?: ReactNode
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
  /** Optional identity frame in the content column (radio row art). */
  leadingMedia?: ReactNode
}

function SelectionOptionCardSummaryLines({ summaryLines }: { summaryLines: string[] }) {
  return (
    <div className="ui-option-card__summary-lines">
      {summaryLines.map((line) => (
        <span key={line} className={OPTION_CARD_SUPPORTING_CLASS}>
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
  summaryContent,
  clampDescription = false,
}: {
  description?: string
  summaryText?: string
  summaryLines?: string[]
  summaryContent?: ReactNode
  clampDescription?: boolean
}) {
  return (
    <>
      {description ? (
        <span
          className={cn(
            OPTION_CARD_SUPPORTING_CLASS,
            clampDescription && 'line-clamp-2 min-h-[2lh]',
          )}
        >
          {description}
        </span>
      ) : null}
      {summaryText ? <span className={OPTION_CARD_SUPPORTING_CLASS}>{summaryText}</span> : null}
      {summaryContent}
      {summaryLines && summaryLines.length > 0 ? (
        <SelectionOptionCardSummaryLines summaryLines={summaryLines} />
      ) : null}
    </>
  )
}

function SelectionOptionCardTitleRow({
  label,
  titleAdornment,
  titleClassName,
  useSummaryTitle,
  clampDescription,
}: {
  label: string
  titleAdornment?: ReactNode
  titleClassName?: string
  useSummaryTitle: boolean
  clampDescription: boolean
}) {
  const TitleElement = useSummaryTitle ? 'h3' : 'span'

  return (
    <div className="ui-option-card__title-row">
      <TitleElement
        className={cn('ui-copy-title', clampDescription && 'line-clamp-1', titleClassName)}
      >
        {label}
      </TitleElement>
      {titleAdornment}
    </div>
  )
}

function SelectionOptionCardPrimaryCopy({
  titleEndSlot,
  titleRow,
  description,
  summaryText,
  summaryLines,
  summaryContent,
  clampDescription,
  copyWidth,
  summaryBadge,
  reserveSummaryBadgeRow,
}: {
  titleEndSlot?: ReactNode
  titleRow: ReactNode
  description?: string
  summaryText?: string
  summaryLines?: string[]
  summaryContent?: ReactNode
  clampDescription: boolean
  copyWidth: SelectionOptionCardCopyWidth
  summaryBadge?: ReactNode
  reserveSummaryBadgeRow: boolean
}) {
  const showSummaryBadgeRow = reserveSummaryBadgeRow || summaryBadge != null

  return (
    <div className={cn('flex min-w-0 w-full flex-col', showSummaryBadgeRow && 'min-h-0 flex-1')}>
      <div className={cn('ui-option-card__primary', showSummaryBadgeRow && 'min-h-0 flex-1')}>
        {titleEndSlot ? (
          <div className="ui-option-card__title-line">
            <div className="min-w-0 shrink">{titleRow}</div>
            <div className="shrink-0">{titleEndSlot}</div>
          </div>
        ) : (
          titleRow
        )}
        <div
          className={cn(
            'ui-option-card__secondary',
            copyWidth === 'content' && 'ui-option-card__secondary--content',
          )}
        >
          <SelectionOptionCardSecondaryContent
            description={description}
            summaryText={summaryText}
            summaryLines={summaryLines}
            summaryContent={summaryContent}
            clampDescription={clampDescription}
          />
        </div>
      </div>
      {showSummaryBadgeRow ? (
        <div className="ui-option-card__summary-badge-row">{summaryBadge}</div>
      ) : null}
    </div>
  )
}

export function SelectionOptionCardAnatomy({
  density = 'comfortable',
  headerRow,
  leadingControl,
  label,
  titleAdornment,
  titleEndSlot,
  description,
  summaryItems,
  summaryLines,
  summaryContent,
  embedded,
  footer,
  titleClassName,
  controlPosition = 'left',
  useSummaryTitle = false,
  summaryBadge,
  reserveSummaryBadgeRow = false,
  clampDescription = false,
  copyWidth = 'fill',
  leadingMedia,
}: SelectionOptionCardAnatomyProps) {
  const summaryText =
    summaryItems && summaryItems.length > 0 ? joinInlineMetadata(summaryItems) : undefined
  const titleRow = (
    <SelectionOptionCardTitleRow
      label={label}
      titleAdornment={titleAdornment}
      titleClassName={titleClassName}
      useSummaryTitle={useSummaryTitle}
      clampDescription={clampDescription}
    />
  )

  const primaryCopy = (
    <SelectionOptionCardPrimaryCopy
      titleEndSlot={titleEndSlot}
      titleRow={titleRow}
      description={description}
      summaryText={summaryText}
      summaryLines={summaryLines}
      summaryContent={summaryContent}
      clampDescription={clampDescription}
      copyWidth={copyWidth}
      summaryBadge={summaryBadge}
      reserveSummaryBadgeRow={reserveSummaryBadgeRow}
    />
  )

  const body = (
    <div className="ui-option-card__body">
      {headerRow}
      {leadingMedia ? (
        <div className={identityInsetRowVariants({ density, align: 'start' })}>
          <div className="shrink-0">{leadingMedia}</div>
          <div className="min-w-0 flex-1">{primaryCopy}</div>
        </div>
      ) : (
        primaryCopy
      )}
      {embedded}
      {footer}
    </div>
  )

  if (!leadingControl) {
    return body
  }

  return (
    <div className={selectionOptionCardAnatomyClassName({ controlPosition })}>
      {leadingControl}
      {body}
    </div>
  )
}

/** Inline muted text immediately after the card title (e.g. dependent-choice status). */
export function SelectionOptionCardTitleMeta({ children }: { children: string }) {
  return <span className={textVariants({ variant: 'supporting' })}>{children}</span>
}
