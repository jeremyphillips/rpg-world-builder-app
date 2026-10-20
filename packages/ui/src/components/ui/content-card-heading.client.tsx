'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { IdentityRowHeadingLine } from './identity-row.client'
import { contentCardHeadingScaleClass, type ContentCardDensity } from './content-card.variants'

export type ContentCardHeadingProps = {
  heading: ReactNode
  classification?: ReactNode | readonly ReactNode[]
  density?: ContentCardDensity
  className?: string
  /** Intrinsic-width slot immediately after the title. */
  headingInline?: ReactNode
}

/** Density scale for the shared identity heading line. Does not draw a second line. */
export function ContentCardHeading({
  heading,
  classification,
  density,
  className,
  headingInline,
}: ContentCardHeadingProps) {
  return (
    <div className={cn(contentCardHeadingScaleClass(density), 'min-w-0', className)}>
      <IdentityRowHeadingLine
        heading={heading}
        classification={classification}
        headingInline={headingInline}
      />
    </div>
  )
}
