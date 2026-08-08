'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
  contentCardHeadingVariants,
  contentCardMixedHeadingNameVariants,
  contentCardMixedHeadingRowVariants,
  contentCardMixedHeadingSeparatorVariants,
  contentCardMixedHeadingSuffixVariants,
  type ContentCardDensity,
} from './content-card.variants'

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

export type ContentCardHeadingProps = {
  heading: ReactNode
  headingSuffix?: ReactNode
  density?: ContentCardDensity
  className?: string
}

export function ContentCardHeading({
  heading,
  headingSuffix,
  density = 'comfortable',
  className,
}: ContentCardHeadingProps) {
  if (!headingSuffix) {
    return <div className={cn(contentCardHeadingVariants({ density }), className)}>{heading}</div>
  }

  const { hasLeadingSeparator, suffixText } = splitHeadingSuffix(headingSuffix)

  return (
    <div className={cn(contentCardMixedHeadingRowVariants({ density }), className)}>
      <span className={contentCardMixedHeadingNameVariants()}>{heading}</span>
      {hasLeadingSeparator ? (
        <span className={contentCardMixedHeadingSeparatorVariants()} aria-hidden>
          ·
        </span>
      ) : null}
      <span className={contentCardMixedHeadingSuffixVariants()}>{suffixText}</span>
    </div>
  )
}
