'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { iconContainerVariants, type IconContainerSize } from './icon-container.variants'

export type IconContainerShape = 'box' | 'circle'
export type { IconContainerSize }

export type IconContainerProps = {
  children: ReactNode
  className?: string
  shape?: IconContainerShape
  size?: IconContainerSize
}

/** Decorative icon container — shared muted surface used in preview rails and entity rows. */
export function IconContainer({
  children,
  className,
  shape = 'box',
  size = 'sm',
}: IconContainerProps) {
  return (
    <div className={cn(iconContainerVariants({ shape, size }), className)} aria-hidden>
      {children}
    </div>
  )
}
