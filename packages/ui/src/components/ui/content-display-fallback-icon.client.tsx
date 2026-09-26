'use client'

import type { ContentDisplayFallback } from '@rpg/contracts'

import { cn } from '../../lib/utils'
import { CONTENT_DISPLAY_FALLBACK_ICONS } from './content-display-fallback-icon.map'
import {
  contentDisplayFallbackIconVariants,
  type ContentDisplayFallbackIconSize,
} from './content-display-fallback-icon.variants'

export { CONTENT_DISPLAY_FALLBACK_ICONS } from './content-display-fallback-icon.map'

export type ContentDisplayFallbackIconProps = {
  fallback: ContentDisplayFallback
  size?: ContentDisplayFallbackIconSize
  className?: string
}

/** Maps semantic {@link ContentDisplayFallback} keys to Lucide icons. */
export function ContentDisplayFallbackIcon({
  fallback,
  size = 'sm',
  className,
}: ContentDisplayFallbackIconProps) {
  const Icon = CONTENT_DISPLAY_FALLBACK_ICONS[fallback] ?? CONTENT_DISPLAY_FALLBACK_ICONS.generic

  return (
    <Icon aria-hidden className={cn(contentDisplayFallbackIconVariants({ size }), className)} />
  )
}
