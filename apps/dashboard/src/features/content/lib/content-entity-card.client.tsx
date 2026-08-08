'use client'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  cn,
  ContentCard,
  ContentCardHeadingAction,
  ContentCardMedia,
  contentCardHeadingLinkVariants,
  contentCardMediaVariants,
  type ContentCardChrome,
  type ContentCardDensity,
  type ContentCardProps,
} from '@rpg/ui'

import { getContentImageUrl } from './detail/content-image-url'

export type ContentEntityCardProps = {
  heading: ReactNode
  headingSuffix?: ReactNode
  href?: string
  subheading?: ReactNode
  metadata?: ReactNode
  imageKey?: string
  headingEndSlot?: ReactNode
  endSlot?: ReactNode
  footer?: ReactNode
  density?: ContentCardDensity
  /** Who draws the outer shell — card (`standalone`) or host (`embedded`). */
  chrome?: ContentCardChrome
  /** Presentational disabled state — host owns interaction disabling and ARIA. */
  disabled?: boolean
  className?: string
}

export function ContentEntityCard({
  heading,
  headingSuffix,
  href,
  subheading,
  metadata,
  imageKey,
  headingEndSlot,
  endSlot,
  footer,
  density,
  chrome,
  disabled = false,
  className,
}: ContentEntityCardProps) {
  const resolvedHeading = href ? (
    <Link to={href} className={contentCardHeadingLinkVariants()}>
      {heading}
    </Link>
  ) : (
    heading
  )

  const resolvedDensity = density ?? 'comfortable'

  const media = imageKey ? (
    <ContentCardMedia
      src={getContentImageUrl(imageKey)}
      alt={typeof heading === 'string' ? heading : ''}
      className={contentCardMediaVariants({ density: resolvedDensity })}
    />
  ) : undefined

  const cardProps: ContentCardProps = {
    heading: resolvedHeading,
    headingSuffix,
    subheading,
    metadata,
    media,
    headingEndSlot,
    endSlot,
    footer,
    density: resolvedDensity,
    chrome,
    className: cn(disabled && 'opacity-60', className),
  }

  return <ContentCard {...cardProps} data-disabled={disabled ? true : undefined} />
}

export function ContentEntityCardViewLink({ href }: { href: string }) {
  return (
    <ContentCardHeadingAction asChild>
      <Link to={href}>View</Link>
    </ContentCardHeadingAction>
  )
}
