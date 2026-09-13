import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

import { cn } from '@rpg/ui'

import {
  PAGE_SCROLL_CONTAINER_ATTR,
  PAGE_SCROLL_CONTAINER_VALUE,
  pageScrollFillWrapperClasses,
  pageScrollShellClasses,
  pageScrollStickyFooterClearanceClasses,
} from './page-scroll.variants'

export interface PageScrollShellProps {
  children: ReactNode
  className?: string
}

/** Route scrollport — the one page vertical scroll owner beneath AppShell main. */
export function PageScrollShell({ children, className }: PageScrollShellProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const scrollport = scrollRef.current
    if (!scrollport) return

    if (typeof scrollport.scrollTo === 'function') {
      scrollport.scrollTo({ top: 0 })
      return
    }

    scrollport.scrollTop = 0
  }, [pathname])

  return (
    <div
      ref={scrollRef}
      {...{ [PAGE_SCROLL_CONTAINER_ATTR]: PAGE_SCROLL_CONTAINER_VALUE }}
      className={cn(pageScrollShellClasses, pageScrollStickyFooterClearanceClasses, className)}
    >
      <div className={pageScrollFillWrapperClasses}>{children}</div>
    </div>
  )
}
