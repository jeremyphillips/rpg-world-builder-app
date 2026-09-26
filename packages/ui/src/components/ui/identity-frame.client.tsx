'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import {
  identityFrameFallbackVariants,
  identityFrameImageVariants,
  identityFrameVariants,
} from './identity-frame.variants'
import type {
  IdentityFrameFit,
  IdentityFrameShape,
  IdentityFrameSize,
} from './identity-frame-tokens.variants'

export type IdentityFrameProps = {
  src?: string
  alt?: string
  fallback?: ReactNode
  shape?: IdentityFrameShape
  size?: IdentityFrameSize
  fit?: IdentityFrameFit
  className?: string
  imageClassName?: string
}

/** Geometry-only image frame — clip, size, shape, and object fit. No crop math. */
export function IdentityFrame({
  src,
  alt = '',
  fallback,
  shape = 'box',
  size = 'sm',
  fit = 'cover',
  className,
  imageClassName,
}: IdentityFrameProps) {
  return (
    <div className={cn(identityFrameVariants({ shape, size }), className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          aria-hidden={alt === '' ? true : undefined}
          className={cn(identityFrameImageVariants({ fit }), imageClassName)}
        />
      ) : fallback ? (
        <div className={identityFrameFallbackVariants({ size })} aria-hidden>
          {fallback}
        </div>
      ) : null}
    </div>
  )
}
