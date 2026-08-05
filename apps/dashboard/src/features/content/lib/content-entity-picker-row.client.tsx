'use client'

import type { ReactNode } from 'react'
import { cn } from '@rpg/ui'

import { ContentEntityRowContent } from './content-entity-row-content.client'

export type ContentEntityPickerRowProps = {
  heading: ReactNode
  subheading?: ReactNode
  imageKey?: string
  endSlot?: ReactNode
  disabled?: boolean
  className?: string
}

/**
 * Catalog picker row presentation for content entities — row content only, with
 * no card shell padding. The CatalogPickerSheet catalog row shell owns chrome.
 */
export function ContentEntityPickerRow({
  heading,
  subheading,
  imageKey,
  endSlot,
  disabled = false,
  className,
}: ContentEntityPickerRowProps) {
  return (
    <ContentEntityRowContent
      heading={heading}
      subheading={subheading}
      imageKey={imageKey}
      endSlot={endSlot}
      density="compact"
      className={cn(disabled && 'opacity-60', className)}
    />
  )
}
