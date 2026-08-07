'use client'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn, contentCardHeadingLinkVariants } from '@rpg/ui'

import {
  detailEntityRowContentVariants,
  detailEntityRowHeadingNameVariants,
  detailEntityRowHeadingSeparatorVariants,
  detailEntityRowHeadingSuffixVariants,
  detailEntityRowHeadingVariants,
  detailEntityRowSubheadingVariants,
  detailEntityRowVariants,
} from './detail-entity-row.variants'

const HEADING_SUFFIX_LEADING_SEPARATOR = ' · ' as const

function splitHeadingSuffix(headingSuffix: ReactNode): {
  hasLeadingSeparator: boolean
  suffixText: ReactNode
} {
  if (
    typeof headingSuffix === 'string' &&
    headingSuffix.startsWith(HEADING_SUFFIX_LEADING_SEPARATOR)
  ) {
    return {
      hasLeadingSeparator: true,
      suffixText: headingSuffix.slice(HEADING_SUFFIX_LEADING_SEPARATOR.length),
    }
  }

  return { hasLeadingSeparator: false, suffixText: headingSuffix }
}

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
    <span className={detailEntityRowHeadingNameVariants()}>
      <Link to={href} className={contentCardHeadingLinkVariants()}>
        {heading}
      </Link>
    </span>
  ) : (
    <span className={detailEntityRowHeadingNameVariants()}>{heading}</span>
  )

  return (
    <div className={cn(detailEntityRowVariants(), className)}>
      <div className={detailEntityRowContentVariants()}>
        <div className={detailEntityRowHeadingVariants()}>
          {resolvedHeading}
          {headingSuffix
            ? (() => {
                const { hasLeadingSeparator, suffixText } = splitHeadingSuffix(headingSuffix)

                return (
                  <>
                    {hasLeadingSeparator ? (
                      <span
                        className={detailEntityRowHeadingSeparatorVariants()}
                        aria-hidden="true"
                      >
                        ·
                      </span>
                    ) : null}
                    <span className={detailEntityRowHeadingSuffixVariants()}>{suffixText}</span>
                  </>
                )
              })()
            : null}
        </div>
        {subheading ? <p className={detailEntityRowSubheadingVariants()}>{subheading}</p> : null}
        {metadata ? <div className={detailEntityRowSubheadingVariants()}>{metadata}</div> : null}
      </div>
      {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
    </div>
  )
}
