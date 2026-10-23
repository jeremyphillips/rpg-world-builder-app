import { forwardRef, type ComponentPropsWithoutRef } from 'react'

import { cn, Panel, type PanelElement } from '@rpg/ui'

export type GlobalSearchResultsPanelProps = Omit<
  ComponentPropsWithoutRef<typeof Panel>,
  'tone' | 'bleed' | 'density'
> & {
  as?: PanelElement
}

/** Shared quiet, bleed panel for full-page and topbar global search results. */
export const GlobalSearchResultsPanel = forwardRef<HTMLElement, GlobalSearchResultsPanelProps>(
  function GlobalSearchResultsPanel({ className, ...props }, ref) {
    return <Panel ref={ref} tone="quiet" bleed className={cn(className)} {...props} />
  },
)
