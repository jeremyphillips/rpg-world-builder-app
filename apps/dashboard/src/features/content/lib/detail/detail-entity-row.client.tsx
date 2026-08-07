'use client'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn, contentCardHeadingLinkVariants } from '@rpg/ui'

import {
  detailEntityRowContentVariants,
  detailEntityRowHeadingNameVariants,
  detailEntityRowHeadingSuffixVariants,
  detailEntityRowHeadingVariants,
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
  className?: string
}

export function DetailEntityRow({
  heading,
  href,
  headingSuffix,
  subheading,
  metadata,
  endSlot,
  className,
}: DetailEntityRowProps) {
  const resolvedHeading = href ? (
    <Link
      to={href}
      className={cn(contentCardHeadingLinkVariants(), detailEntityRowHeadingNameVariants())}
    >
      {heading}
    </Link>
  ) : (
    <span className={detailEntityRowHeadingNameVariants()}>{heading}</span>
  )

  return (
    <div className={cn(detailEntityRowVariants(), className)}>
      <div className={detailEntityRowContentVariants()}>
        <div className={detailEntityRowHeadingVariants()}>
          {resolvedHeading}
          {headingSuffix ? (
            <span className={detailEntityRowHeadingSuffixVariants()}>{headingSuffix}</span>
          ) : null}
        </div>
        {subheading ? <p className={detailEntityRowSubheadingVariants()}>{subheading}</p> : null}
        {metadata ? <div className={detailEntityRowSubheadingVariants()}>{metadata}</div> : null}
      </div>
      {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
    </div>
  )
}
