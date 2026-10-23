'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { DialogPanelScrollRegion } from './dialog-panel-scroll-region.client'
import { dialogPanelSectionInsetXClasses } from './dialog-panel.variants'

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
      return (
        <div
          ref={ref}
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-hidden pt-0 pb-0 text-sm',
            mode === 'stable' && dialogPanelSectionInsetXClasses,
            shellClassName,
            className,
          )}
          {...props}
        >
          {children}
        </div>
      )
    }

    if (mode === 'managed') {
      return (
        <div
          ref={ref}
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-hidden p-0 text-sm',
            shellClassName,
            className,
          )}
          {...props}
        >
          {children}
        </div>
      )
    }

    return (
      <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden text-sm', shellClassName)}>
        <DialogPanelScrollRegion inset="section" ref={ref} viewportClassName={className} {...props}>
          {children}
        </DialogPanelScrollRegion>
      </div>
    )
  },
)
DialogPanelBody.displayName = 'DialogPanelBody'
