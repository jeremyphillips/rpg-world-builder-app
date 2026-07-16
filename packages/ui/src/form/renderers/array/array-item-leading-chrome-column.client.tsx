'use client'

import * as React from 'react'

import { cn } from '../../../lib/utils'
import { arrayItemChromeColumnClasses } from './array-item-toolbar.variants'

export interface ArrayItemLeadingChromeColumnProps {
  children: React.ReactNode
  className?: string
  'aria-hidden'?: boolean
}

/** Fixed-width leading column for decorative markers (e.g. nested relationship icons). */
export function ArrayItemLeadingChromeColumn({
  children,
  className,
  'aria-hidden': ariaHidden = true,
}: ArrayItemLeadingChromeColumnProps) {
  return (
    <div className={cn(arrayItemChromeColumnClasses, className)} aria-hidden={ariaHidden}>
      {children}
    </div>
  )
}
