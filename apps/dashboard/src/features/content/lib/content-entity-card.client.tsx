'use client'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ContentCard,
  ContentCardHeadingAction,
  ContentCardMedia,
  contentCardHeadingLinkVariants,
  type ContentCardDensity,
  type ContentCardProps,
  type ContentCardSurface,
} from '@rpg/ui'

import { getContentImageUrl } from './detail/content-image-url'

export type ContentEntityCardProps = {
  heading: ReactNode
  href?: string
  subheading?: ReactNode
  metadata?: ReactNode
  imageKey?: string
  headingEndSlot?: ReactNode
  endSlot?: ReactNode
  footer?: ReactNode
  density?: ContentCardDensity
  surface?: ContentCardSurface
  className?: string
}

export function ContentEntityCard({
  heading,
  href,
  subheading,
  metadata,
  imageKey,
  headingEndSlot,
  endSlot,
  footer,
  density,
  surface,
  className,
}: ContentEntityCardProps) {
  const resolvedHeading = href ? (
    <Link to={href} className={contentCardHeadingLinkVariants()}>
      {heading}
    </Link>
  ) : (
    heading
  )

  const media = imageKey ? (
    <ContentCardMedia
      src={getContentImageUrl(imageKey)}
      alt={typeof heading === 'string' ? heading : ''}
    />
  ) : undefined

  const cardProps: ContentCardProps = {
    heading: resolvedHeading,
    subheading,
    metadata,
    media,
    headingEndSlot,
    endSlot,
    footer,
    density,
    surface,
    className,
  }

  return <ContentCard {...cardProps} />
}

export function ContentEntityCardViewLink({ href }: { href: string }) {
  return (
    <ContentCardHeadingAction asChild>
      <Link to={href}>View</Link>
    </ContentCardHeadingAction>
  )
}
