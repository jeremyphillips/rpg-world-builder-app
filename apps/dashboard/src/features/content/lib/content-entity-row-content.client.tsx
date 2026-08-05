'use client'

import type { ReactNode } from 'react'

import { ContentCardBody, ContentCardMedia, type ContentCardDensity } from '@rpg/ui'

import { getContentImageUrl } from './detail/content-image-url'

export type ContentEntityRowContentProps = {
  heading: ReactNode
  subheading?: ReactNode
  metadata?: ReactNode
  imageKey?: string
  headingEndSlot?: ReactNode
  endSlot?: ReactNode
  footer?: ReactNode
  density?: ContentCardDensity
  className?: string
}

/** Shared entity row presentation — no card shell; embed inside detail cards or picker rows. */
export function ContentEntityRowContent({
  heading,
  subheading,
  metadata,
  imageKey,
  headingEndSlot,
  endSlot,
  footer,
  density = 'compact',
  className,
}: ContentEntityRowContentProps) {
  const media = imageKey ? (
    <ContentCardMedia
      src={getContentImageUrl(imageKey)}
      alt={typeof heading === 'string' ? heading : ''}
    />
  ) : undefined

  return (
    <ContentCardBody
      heading={heading}
      subheading={subheading}
      metadata={metadata}
      media={media}
      headingEndSlot={headingEndSlot}
      endSlot={endSlot}
      footer={footer}
      density={density}
      className={className}
    />
  )
}
