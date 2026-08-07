'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { ContentCardHeading } from './content-card-heading.client'
import { resolveContentCardHeadingRowRhythm } from './content-card.lib'
import {
  contentCardBodyVariants,
  contentCardHeadingEndSlotVariants,
  contentCardHeadingRowVariants,
  contentCardMetadataVariants,
  contentCardSubheadingVariants,
  type ContentCardDensity,
} from './content-card.variants'

export type ContentCardBodyProps = {
  heading: ReactNode
  headingSuffix?: ReactNode
  subheading?: ReactNode
  metadata?: ReactNode
  media?: ReactNode
  headingEndSlot?: ReactNode
  endSlot?: ReactNode
  footer?: ReactNode
  density?: ContentCardDensity
  rowAlign?: 'start' | 'center'
  className?: string
}

/** @internal Layout-only entity row anatomy — use {@link ContentCard} or dashboard `ContentEntityCard`. */
export function ContentCardBody({
  heading,
  headingSuffix,
  subheading,
  metadata,
  media,
  headingEndSlot,
  endSlot,
  footer,
  density = 'comfortable',
  rowAlign: rowAlignProp,
  className,
}: ContentCardBodyProps) {
  const hasSecondaryText = Boolean(subheading || metadata)
  const rowAlign = rowAlignProp ?? (hasSecondaryText ? 'start' : 'center')
  const headingRowRhythm = resolveContentCardHeadingRowRhythm({
    hasSecondaryText,
    hasHeadingEndSlot: Boolean(headingEndSlot),
  })

  return (
    <div className={cn(contentCardBodyVariants({ density, rowAlign }), className)}>
      {media ? <div className="shrink-0">{media}</div> : null}
      <div className="min-w-0 flex-1">
        <div className={contentCardHeadingRowVariants({ rhythm: headingRowRhythm })}>
          <div className="min-w-0 flex-1">
            <ContentCardHeading heading={heading} headingSuffix={headingSuffix} density={density} />
          </div>
          {headingEndSlot ? (
            <div className={contentCardHeadingEndSlotVariants()}>{headingEndSlot}</div>
          ) : null}
        </div>
        {subheading ? (
          <div className={contentCardSubheadingVariants({ density })}>{subheading}</div>
        ) : null}
        {metadata ? (
          <div className={contentCardMetadataVariants({ density })}>{metadata}</div>
        ) : null}
        {footer ? <div className="mt-2">{footer}</div> : null}
      </div>
      {endSlot ? <div className="shrink-0 self-center">{endSlot}</div> : null}
    </div>
  )
}
