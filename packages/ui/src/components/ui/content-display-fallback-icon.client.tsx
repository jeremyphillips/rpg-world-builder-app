'use client'

import type { ContentDisplayFallback } from '@rpg/contracts'

import { cn } from '../../lib/utils'
import { CONTENT_DISPLAY_FALLBACK_ICONS } from './content-display-fallback-icon.map'
import { Icon } from './icon/icon'
import type { IconSizeMode } from './icon/icon.types'

export { CONTENT_DISPLAY_FALLBACK_ICONS } from './content-display-fallback-icon.map'
export { contentIdentityIcon } from './content-identity-icon.lib'

export type ContentDisplayFallbackIconProps = {
  fallback: ContentDisplayFallback
  size: IconSizeMode
  className?: string
}

/** Maps semantic {@link ContentDisplayFallback} keys to registry glyphs. */
export function ContentDisplayFallbackIcon({
  fallback,
  size,
  className,
}: ContentDisplayFallbackIconProps) {
  const name = CONTENT_DISPLAY_FALLBACK_ICONS[fallback] ?? CONTENT_DISPLAY_FALLBACK_ICONS.generic

  return <Icon name={name} size={size} className={cn('text-muted-foreground', className)} />
}
