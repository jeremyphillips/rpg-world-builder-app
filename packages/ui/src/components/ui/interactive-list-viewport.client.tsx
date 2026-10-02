'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { interactiveListViewportVariants } from './interactive-list.variants'

export interface InteractiveListViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

/** Bounded scrollport — search/filter chrome stays outside this region. */
export function InteractiveListViewport({
  children,
  className,
  ...props
}: InteractiveListViewportProps) {
  return (
    <div className={cn(interactiveListViewportVariants(), className)} {...props}>
      {children}
    </div>
  )
}
