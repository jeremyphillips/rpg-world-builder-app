'use client'

import type { ReactNode } from 'react'

import { cn } from '../lib/utils'
import { useOptionalFilterChrome } from './filter-chrome.context'
import { resolveFilterControlSize } from './filter-presentation.lib'
import {
  filterInlineControlVariants,
  type FilterInlineControlShellVariant,
} from './filter-inline-control.variants'

export type FilterInlineControlProps = {
  children: ReactNode
  className?: string
  /** Surface chrome — default `outline`. Appearance is orthogonal to filter density/size. */
  variant?: FilterInlineControlShellVariant
}

/** Inline boolean filter shell — matches adjacent control height and focus ring. */
export function FilterInlineControl({
  children,
  className,
  variant = 'outline',
}: FilterInlineControlProps) {
  const chrome = useOptionalFilterChrome()
  const size = resolveFilterControlSize(chrome?.density)

  return (
    <div
      data-field-align=""
      className={cn(filterInlineControlVariants({ size, variant }), className)}
    >
      {children}
    </div>
  )
}
