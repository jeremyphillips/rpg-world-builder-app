'use client'

import { Trash2 } from 'lucide-react'

import { cn } from '../../lib/utils'
import { contentCardRemoveButtonVariants } from './content-card.variants'
import { IdentityFrame } from './identity-frame.client'
import type { ContentCardDensity } from './content-card.variants'
import { resolveContentCardMediaFrameSize } from './content-card-media.lib'

export type ContentCardMediaProps = {
  src: string
  alt?: string
  density?: ContentCardDensity
  className?: string
}

/** Compact entity thumb — geometry-only frame at card density. */
export function ContentCardMedia({
  src,
  alt = '',
  density = 'comfortable',
  className,
}: ContentCardMediaProps) {
  return (
    <IdentityFrame
      src={src}
      alt={alt}
      shape="box"
      size={resolveContentCardMediaFrameSize(density)}
      className={className}
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
