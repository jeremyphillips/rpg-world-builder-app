'use client'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn, contentCardHeadingLinkVariants } from '@rpg/ui'

import {
  detailEntityRowContentVariants,
  detailEntityRowHeadingVariants,
  detailEntityRowSubheadingVariants,
  detailEntityRowVariants,
} from './detail-entity-row.variants'

export type DetailEntityRowProps = {
  heading: ReactNode
  href?: string
  subheading?: ReactNode
  metadata?: ReactNode
  endSlot?: ReactNode
  className?: string
}

export function DetailEntityRow({
  heading,
  href,
  subheading,
  metadata,
  endSlot,
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
    <div className={cn(detailEntityRowVariants(), className)}>
      <div className={detailEntityRowContentVariants()}>
        <div className={detailEntityRowHeadingVariants()}>{resolvedHeading}</div>
        {subheading ? <p className={detailEntityRowSubheadingVariants()}>{subheading}</p> : null}
        {metadata ? <div className={detailEntityRowSubheadingVariants()}>{metadata}</div> : null}
      </div>
      {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
    </div>
  )
}
