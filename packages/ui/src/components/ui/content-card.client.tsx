'use client'

import { cn } from '../../lib/utils'
import { ContentCardBody, type ContentCardBodyProps } from './content-card-body.client'
import {
  contentCardRootVariants,
  type ContentCardDensity,
  type ContentCardSurface,
} from './content-card.variants'

export type ContentCardProps = Omit<ContentCardBodyProps, 'rowAlign' | 'className'> & {
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
  const rowAlign = hasSecondaryText ? 'start' : 'center'

  return (
    <article className={cn(contentCardRootVariants({ density, surface }), className)}>
      <ContentCardBody
        heading={heading}
        subheading={subheading}
        metadata={metadata}
        media={media}
        headingEndSlot={headingEndSlot}
        endSlot={endSlot}
        footer={footer}
        density={density}
        rowAlign={rowAlign}
      />
    </article>
  )
}
