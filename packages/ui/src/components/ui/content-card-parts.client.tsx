'use client'

import type { ContentDisplayFallback } from '@rpg/contracts'

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
      fallback={<ContentDisplayFallbackIcon fallback={fallback} size="owner" />}
    />
  )
}
