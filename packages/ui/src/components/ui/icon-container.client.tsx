'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { iconContainerVariants } from './icon-container.variants'

export type IconContainerShape = 'box' | 'circle'

export type IconContainerProps = {
  children: ReactNode
  className?: string
  shape?: IconContainerShape
}

/** Decorative icon container — shared muted surface used in preview rails and entity rows. */
export function IconContainer({ children, className, shape = 'box' }: IconContainerProps) {
  return (
    <div className={cn(iconContainerVariants({ shape }), className)} aria-hidden>
      {children}
    </div>
  )
}
