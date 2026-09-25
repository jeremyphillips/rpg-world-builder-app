'use client'

import type { ContentDisplayFallback } from '@rpg/contracts'
import { Backpack, Building2, Castle, Flag, MapPin, User, type LucideIcon } from 'lucide-react'

import { cn } from '../../lib/utils'
import {
  contentDisplayFallbackIconVariants,
  type ContentDisplayFallbackIconSize,
} from './content-display-fallback-icon.variants'

const CONTENT_DISPLAY_FALLBACK_ICONS: Record<ContentDisplayFallback, LucideIcon> = {
  character: User,
  location: MapPin,
  organization: Building2,
  campaign: Flag,
  equipment: Backpack,
  generic: Castle,
}

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
