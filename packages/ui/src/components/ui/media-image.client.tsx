'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  mediaImagePlaceholderVariants,
  mediaImageVariants,
  type MediaImageVariantProps,
} from './media-image.variants'

export type MediaImageProps = MediaImageVariantProps & {
  src?: string
  alt?: string
  className?: string
  placeholderLabel?: string
}

/** Reserved-dimension image surface with explicit error and placeholder states. */
export function MediaImage({
  src,
  alt = '',
  shape,
  size,
  className,
  placeholderLabel = 'Image unavailable',
}: MediaImageProps) {
  const [status, setStatus] = React.useState<'loading' | 'loaded' | 'error'>(
    src ? 'loading' : 'error',
  )

  React.useEffect(() => {
    setStatus(src ? 'loading' : 'error')
  }, [src])

  const showImage = Boolean(src) && status !== 'error'

  return (
    <span className={cn(mediaImageVariants({ shape, size }), className)}>
      {showImage ? (
        <img
          src={src}
          alt={alt}
          aria-hidden={alt === '' ? true : undefined}
          className="size-full object-cover"
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      ) : (
        <span
          className={cn(
            mediaImagePlaceholderVariants({ tone: status === 'error' ? 'error' : 'neutral' }),
            'flex items-center justify-center text-xs',
          )}
          aria-label={placeholderLabel}
          role="img"
        />
      )}
    </span>
  )
}
