'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { interactiveListEmptyVariants, interactiveListVariants } from './interactive-list.variants'

export interface InteractiveListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

/** Row-list wrapper — hosts set `listbox`, `menu`, or section semantics as needed. */
export const InteractiveList = React.forwardRef<HTMLDivElement, InteractiveListProps>(
  function InteractiveList({ children, className, ...props }, ref) {
    return (
      <div ref={ref} className={cn(interactiveListVariants(), className)} {...props}>
        {children}
      </div>
    )
  },
)

export interface InteractiveListEmptyProps {
  children: React.ReactNode
  className?: string
}

export function InteractiveListEmpty({ children, className }: InteractiveListEmptyProps) {
  return <p className={cn(interactiveListEmptyVariants(), className)}>{children}</p>
}
