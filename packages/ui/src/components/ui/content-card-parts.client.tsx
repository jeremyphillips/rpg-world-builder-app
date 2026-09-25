'use client'

import type { ContentDisplayFallback } from '@rpg/contracts'
import { Trash2 } from 'lucide-react'

import { cn } from '../../lib/utils'
import { contentCardRemoveButtonVariants } from './content-card.variants'
import { ContentDisplayFallbackIcon } from './content-display-fallback-icon.client'
import { IdentityFrame } from './identity-frame.client'
import type { ContentCardDensity } from './content-card.variants'
import { resolveContentCardMediaFrameSize } from './content-card-media.lib'

export type ContentCardMediaProps = {
  /** Resolved upload or system artwork URL. */
  src?: string
  /** Semantic empty-state key — always renders a frame when no `src`. */
  fallback?: ContentDisplayFallback
  alt?: string
  density?: ContentCardDensity
  className?: string
}

/** Compact entity thumb — image or semantic fallback icon at card density. */
export function ContentCardMedia({
  src,
  fallback = 'generic',
  alt = '',
  density = 'comfortable',
  className,
}: ContentCardMediaProps) {
  const frameSize = resolveContentCardMediaFrameSize(density)

  return (
    <IdentityFrame
      src={src}
      alt={alt}
      shape="box"
      size={frameSize}
      className={className}
      fallback={<ContentDisplayFallbackIcon fallback={fallback} size={frameSize} />}
    />
  )
}

export const CONTENT_CARD_REMOVE_LABEL_PREFIX = 'Remove' as const

export function formatContentCardRemoveLabel(label: string): string {
  return `${CONTENT_CARD_REMOVE_LABEL_PREFIX} ${label}`
}

export type ContentCardRemoveButtonProps = {
  label: string
  removeAriaLabel?: string
  onRemove: () => void
  className?: string
}

export function ContentCardRemoveButton({
  label,
  removeAriaLabel,
  onRemove,
  className,
}: ContentCardRemoveButtonProps) {
  return (
    <button
      type="button"
      className={cn(contentCardRemoveButtonVariants(), className)}
      aria-label={removeAriaLabel ?? formatContentCardRemoveLabel(label)}
      onClick={onRemove}
    >
      <Trash2 aria-hidden />
    </button>
  )
}
