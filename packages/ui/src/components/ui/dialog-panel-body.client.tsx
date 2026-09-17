'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { DialogPanelScrollRegion } from './dialog-panel-scroll-region.client'
import {
  dialogPanelBodyVariants,
  dialogPanelManagedBodyVariants,
  dialogPanelStableBodyClipVariants,
  dialogPanelStableBodyVariants,
} from './dialog-panel.variants'

export type DialogPanelBodyMode = 'scroll' | 'stable' | 'stableClip' | 'managed'

export interface DialogPanelBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: DialogPanelBodyMode
  /** Extra classes on the clip shell (e.g. Sheet `gap-*` on stable/managed only). */
  shellClassName?: string
}

/**
 * Shared Modal/Sheet body — default path auto-wires {@link DialogPanelScrollRegion}.
 * Consumer `className`, `ref`, and HTML attributes land on the scroll viewport;
 * stable/managed modes keep a single clip shell with all attributes on it.
 */
export const DialogPanelBody = React.forwardRef<HTMLDivElement, DialogPanelBodyProps>(
  ({ className, shellClassName, mode = 'scroll', children, ...props }, ref) => {
    if (mode === 'stable' || mode === 'stableClip') {
      const stableBodyVariants =
        mode === 'stableClip' ? dialogPanelStableBodyClipVariants : dialogPanelStableBodyVariants

      return (
        <div ref={ref} className={cn(stableBodyVariants(), shellClassName, className)} {...props}>
          {children}
        </div>
      )
    }

    if (mode === 'managed') {
      return (
        <div
          ref={ref}
          className={cn(dialogPanelManagedBodyVariants(), shellClassName, className)}
          {...props}
        >
          {children}
        </div>
      )
    }

    return (
      <div className={cn(dialogPanelBodyVariants(), shellClassName)}>
        <DialogPanelScrollRegion inset="section" ref={ref} viewportClassName={className} {...props}>
          {children}
        </DialogPanelScrollRegion>
      </div>
    )
  },
)
DialogPanelBody.displayName = 'DialogPanelBody'
