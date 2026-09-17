'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { iconBoxVariants } from './icon-box.variants'

export type IconBoxProps = {
  children: ReactNode
  className?: string
}

/** Decorative icon container — shared muted square used in preview rails and entity rows. */
export function IconBox({ children, className }: IconBoxProps) {
  return (
    <div className={cn(iconBoxVariants(), className)} aria-hidden>
      {children}
    </div>
  )
}
