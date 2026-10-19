'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
  contentCardHeadingScaleClass,
  contentCardHeadingVariants,
  contentCardMixedHeadingRowVariants,
  contentCardMixedHeadingNameVariants,
  contentCardMixedHeadingSuffixVariants,
  type ContentCardDensity,
} from './content-card.variants'
import { InlineMetadata } from './inline-metadata'

function isPresent(value: ReactNode): boolean {
  return value != null && value !== '' && value !== false
}

function classificationItems(classification: ReactNode | readonly ReactNode[]): ReactNode[] {
  if (Array.isArray(classification)) {
    return classification.filter(isPresent)
  }
  return [classification]
}

export type ContentCardHeadingProps = {
  heading: ReactNode
  classification?: ReactNode | readonly ReactNode[]
  density?: ContentCardDensity
  className?: string
  /** Intrinsic-width slot immediately after the title. */
  headingInline?: ReactNode
}

export function ContentCardHeading({
  heading,
  classification,
  density,
  className,
  headingInline,
}: ContentCardHeadingProps) {
  const items = classification ? classificationItems(classification) : []
  const showHeadingInline = isPresent(headingInline)
  const scaleClass = cn(contentCardHeadingScaleClass(density), contentCardHeadingVariants())

  if (items.length === 0 && !showHeadingInline) {
    return <div className={cn(scaleClass, className)}>{heading}</div>
  }

  const metaDensity = density === 'compact' ? 'compact' : 'comfortable'

  if (items.length === 0 && showHeadingInline) {
    return (
      <div className={cn(contentCardMixedHeadingRowVariants(), scaleClass, className)}>
        <span
          className={cn(contentCardMixedHeadingNameVariants(), 'flex min-w-0 items-center gap-1')}
        >
          <span className="min-w-0 truncate">{heading}</span>
          <span className="shrink-0 self-center" data-heading-inline="">
            {headingInline}
          </span>
        </span>
      </div>
    )
  }

  return (
    <div className={cn(contentCardMixedHeadingRowVariants(), scaleClass, className)}>
      <InlineMetadata role="heading" density={metaDensity} wrap={false} className="min-w-0 flex-1">
        {showHeadingInline ? (
          <InlineMetadata.Item className="flex min-w-0 items-center gap-1">
            <span className={cn(contentCardMixedHeadingNameVariants(), 'min-w-0 truncate')}>
              {heading}
            </span>
            <span className="shrink-0 self-center" data-heading-inline="">
              {headingInline}
            </span>
          </InlineMetadata.Item>
        ) : (
          <InlineMetadata.Item truncate className={contentCardMixedHeadingNameVariants()}>
            {heading}
          </InlineMetadata.Item>
        )}
        {items.map((item, index) => (
          <InlineMetadata.Item key={index} className={contentCardMixedHeadingSuffixVariants()}>
            {item}
          </InlineMetadata.Item>
        ))}
      </InlineMetadata>
    </div>
  )
}
