'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { listResultViewportVariants } from './list-result.variants'

export interface ListResultViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

/** Bounded scrollport — search/filter chrome stays outside this region. */
export function ListResultViewport({ children, className, ...props }: ListResultViewportProps) {
  return (
    <div className={cn(listResultViewportVariants(), className)} {...props}>
      {children}
    </div>
  )
}
