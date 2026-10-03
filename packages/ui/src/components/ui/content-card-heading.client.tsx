'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
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
  return isPresent(classification) ? [classification] : []
}

export type ContentCardHeadingProps = {
  heading: ReactNode
  classification?: ReactNode | readonly ReactNode[]
  density?: ContentCardDensity
  className?: string
}

export function ContentCardHeading({
  heading,
  classification,
  density = 'comfortable',
  className,
}: ContentCardHeadingProps) {
  const items = classification ? classificationItems(classification) : []

  if (items.length === 0) {
    return <div className={cn(contentCardHeadingVariants({ density }), className)}>{heading}</div>
  }

  const metaDensity = density === 'compact' ? 'compact' : 'comfortable'

  return (
    <div className={cn(contentCardMixedHeadingRowVariants({ density }), className)}>
      <InlineMetadata role="heading" density={metaDensity} wrap={false} className="min-w-0 flex-1">
        <InlineMetadata.Item truncate className={contentCardMixedHeadingNameVariants()}>
          {heading}
        </InlineMetadata.Item>
        {items.map((item, index) => (
          <InlineMetadata.Item key={index} className={contentCardMixedHeadingSuffixVariants()}>
            {item}
          </InlineMetadata.Item>
        ))}
      </InlineMetadata>
    </div>
  )
}
