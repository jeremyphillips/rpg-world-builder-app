'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const avatarVariants = cva(
  'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground',
  {
    variants: {
      size: {
        sm: 'size-7 text-xs',
        md: 'size-9 text-sm',
        lg: 'size-11 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
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
