'use client'

import type { ResolvedContentMediaPresentation } from '@rpg/contracts'

import { cn } from '../../lib/utils'
import { MediaImage, type MediaImageProps } from './media-image.client'

export type MediaCompactPreviewProps = Omit<MediaImageProps, 'shape'> & {
  presentation: ResolvedContentMediaPresentation
  src?: string
  variant?: 'square' | 'circle'
}

/** Square or circular compact preview driven by resolver output (alt may be empty). */
export function MediaCompactPreview({
  presentation,
  src,
  variant = 'square',
  alt,
  className,
  ...props
}: MediaCompactPreviewProps) {
  const resolvedAlt = alt ?? presentation.alt

  return (
    <MediaImage
      {...props}
      src={src}
      alt={resolvedAlt}
      shape={variant === 'circle' ? 'circle' : 'square'}
      className={cn(className)}
      placeholderLabel={
        presentation.kind === 'placeholder' ? 'No image assigned' : 'Image unavailable'
      }
    />
  )
}
