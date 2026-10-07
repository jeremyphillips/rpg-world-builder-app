'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { ContentCardHeading } from './content-card-heading.client'
import { resolveContentCardHeadingRowRhythm } from './content-card.lib'
import {
  contentCardBodyVariants,
  contentCardHeadingEndSlotVariants,
  contentCardHeadingRowVariants,
  contentCardMediaEndGapVariants,
  contentCardMetadataVariants,
  contentCardSubheadingVariants,
  resolveContentCardBodyCrossAxis,
  type ContentCardDensity,
} from './content-card.variants'

export type ContentCardBodyProps = {
  heading: ReactNode
  classification?: ReactNode | readonly ReactNode[]
  subheading?: ReactNode
  metadata?: ReactNode
  media?: ReactNode
  headingEndSlot?: ReactNode
  endSlot?: ReactNode
  footer?: ReactNode
  density?: ContentCardDensity
  className?: string
}

/** @internal Layout-only entity row anatomy — use {@link ContentCard} or dashboard `ContentEntityCard`. */
export function ContentCardBody({
  heading,
  classification,
  subheading,
  metadata,
  media,
  headingEndSlot,
  endSlot,
  footer,
  density = 'comfortable',
  className,
}: ContentCardBodyProps) {
  const hasSecondaryText = Boolean(subheading || metadata)
  const crossAxis = resolveContentCardBodyCrossAxis(hasSecondaryText)
  const headingRowRhythm = resolveContentCardHeadingRowRhythm({
    hasSecondaryText,
    hasHeadingEndSlot: Boolean(headingEndSlot),
  })

  return (
    <div className={cn(contentCardBodyVariants({ density, crossAxis }), className)}>
      {media ? (
        <div className={cn('shrink-0', contentCardMediaEndGapVariants({ density }))}>{media}</div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className={contentCardHeadingRowVariants({ rhythm: headingRowRhythm })}>
          <div className="min-w-0 flex-1">
            <ContentCardHeading
              heading={heading}
              classification={classification}
              density={density}
            />
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
