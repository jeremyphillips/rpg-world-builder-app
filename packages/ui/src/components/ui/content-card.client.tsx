'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { resolveContentCardHeadingRowRhythm } from './content-card.lib'
import {
  contentCardHeadingEndSlotVariants,
  contentCardHeadingRowVariants,
  contentCardHeadingVariants,
  contentCardMetadataVariants,
  contentCardRootVariants,
  contentCardSubheadingVariants,
  type ContentCardDensity,
  type ContentCardSurface,
} from './content-card.variants'

export type ContentCardProps = {
  heading: ReactNode
  subheading?: ReactNode
  metadata?: ReactNode
  media?: ReactNode
  headingEndSlot?: ReactNode
  endSlot?: ReactNode
  footer?: ReactNode
  density?: ContentCardDensity
  surface?: ContentCardSurface
  className?: string
}

// Future variants should be added only when demonstrated by a real ContentCard consumer.
export function ContentCard({
  heading,
  subheading,
  metadata,
  media,
  headingEndSlot,
  endSlot,
  footer,
  density = 'comfortable',
  surface = 'outline',
  className,
}: ContentCardProps) {
  const hasSecondaryText = Boolean(subheading || metadata)
  const headingRowRhythm = resolveContentCardHeadingRowRhythm({
    hasSecondaryText,
    hasHeadingEndSlot: Boolean(headingEndSlot),
  })

  return (
    <article
      className={cn(
        contentCardRootVariants({
          density,
          surface,
          rowAlign: hasSecondaryText ? 'start' : 'center',
        }),
        className,
      )}
    >
      {media ? <div className="shrink-0">{media}</div> : null}
      <div className="min-w-0 flex-1">
        <div className={contentCardHeadingRowVariants({ rhythm: headingRowRhythm })}>
          <div className={cn('min-w-0 flex-1', contentCardHeadingVariants({ density }))}>
            {heading}
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
      {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
    </article>
  )
}
