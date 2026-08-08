'use client'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn, ContentCardHeading, contentCardHeadingLinkVariants } from '@rpg/ui'

import {
  detailEntityRowContentVariants,
  detailEntityRowSubheadingVariants,
  detailEntityRowVariants,
} from './detail-entity-row.variants'

export type DetailEntityRowProps = {
  heading: ReactNode
  href?: string
  /** Muted classification text rendered inline after the heading (includes leading separator). */
  headingSuffix?: ReactNode
  subheading?: ReactNode
  metadata?: ReactNode
  endSlot?: ReactNode
  inset?: 'self' | 'parent'
  className?: string
}

export function DetailEntityRow({
  heading,
  href,
  headingSuffix,
  subheading,
  metadata,
  endSlot,
  inset = 'self',
  className,
}: DetailEntityRowProps) {
  const resolvedHeading = href ? (
    <Link to={href} className={contentCardHeadingLinkVariants()}>
      {heading}
    </Link>
  ) : (
    heading
  )

  return (
    <div className={cn(detailEntityRowVariants({ inset }), className)}>
      <div className={detailEntityRowContentVariants()}>
        <ContentCardHeading
          heading={resolvedHeading}
          headingSuffix={headingSuffix}
          density="compact"
        />
        {subheading ? <p className={detailEntityRowSubheadingVariants()}>{subheading}</p> : null}
        {metadata ? <div className={detailEntityRowSubheadingVariants()}>{metadata}</div> : null}
      </div>
      {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
    </div>
  )
}
