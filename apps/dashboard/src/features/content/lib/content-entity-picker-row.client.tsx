'use client'

import type { ReactNode } from 'react'
import { cn } from '@rpg/ui'

import { ContentEntityCard } from './content-entity-card.client'

export type ContentEntityPickerRowProps = {
  heading: ReactNode
  subheading?: ReactNode
  imageKey?: string
  disabled?: boolean
  className?: string
}

/**
 * Catalog picker row presentation for content entities — ghost/compact card
 * rhythm inside a CatalogPickerSheet catalog row shell. Selection actions belong
 * in `renderItemActions`, not on this component.
 */
export function ContentEntityPickerRow({
  heading,
  subheading,
  imageKey,
  disabled = false,
  className,
}: ContentEntityPickerRowProps) {
  return (
    <ContentEntityCard
      heading={heading}
      subheading={subheading}
      imageKey={imageKey}
      density="compact"
      surface="ghost"
      className={cn(disabled && 'opacity-60', className)}
    />
  )
}
