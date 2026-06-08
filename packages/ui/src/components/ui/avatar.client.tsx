'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { avatarVariants, type AvatarVariantProps } from './avatar.variants'

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

export interface AvatarProps extends AvatarVariantProps {
  name: string
  src?: string
  className?: string
}

export function Avatar({ name, src, size, className }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)
  const initials = getInitials(name)
  const showImage = src && !imgError

  return (
    <span className={cn(avatarVariants({ size }), className)} aria-label={name}>
      {showImage ? (
        <img
          src={src}
          alt={name}
          className="size-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  )
}
