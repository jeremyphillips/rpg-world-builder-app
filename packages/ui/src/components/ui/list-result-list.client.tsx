'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { listResultEmptyVariants, listResultListVariants } from './list-result.variants'

export interface ListResultListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

/** Non-scrolling list shell — hosts set `role="listbox"` or section semantics as needed. */
export const ListResultList = React.forwardRef<HTMLDivElement, ListResultListProps>(
  function ListResultList({ children, className, ...props }, ref) {
    return (
      <div ref={ref} className={cn(listResultListVariants(), className)} {...props}>
        {children}
      </div>
    )
  },
)

export interface ListResultEmptyProps {
  children: React.ReactNode
  className?: string
}

export function ListResultEmpty({ children, className }: ListResultEmptyProps) {
  return <p className={cn(listResultEmptyVariants(), className)}>{children}</p>
}
