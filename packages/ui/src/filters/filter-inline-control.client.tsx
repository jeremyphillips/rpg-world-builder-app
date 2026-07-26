'use client'

import type { ReactNode } from 'react'

import { cn } from '../lib/utils'
import { useOptionalFilterChrome } from './filter-chrome.context'
import { resolveFilterControlSize } from './filter-presentation.lib'
import { filterInlineControlVariants } from './filter-inline-control.variants'

export type FilterInlineControlProps = {
  children: ReactNode
  className?: string
}

/** Inline boolean filter shell — matches adjacent control height, border, and focus ring. */
export function FilterInlineControl({ children, className }: FilterInlineControlProps) {
  const chrome = useOptionalFilterChrome()
  const size = resolveFilterControlSize(chrome?.density)

  return (
    <div data-field-align="" className={cn(filterInlineControlVariants({ size }), className)}>
      {children}
    </div>
  )
}
