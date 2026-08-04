'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Info } from 'lucide-react'

import { cn } from '../../lib/utils'
import { portalPopoverSurfaceClasses } from './surface-current.lib'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 max-w-xs rounded-md border border-border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=delayed-open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        portalPopoverSurfaceClasses,
        className,
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export interface InfoTooltipProps {
  /** Required: the accessible name announced for the info trigger. */
  'aria-label': string
  /** Tooltip body — short text or simple inline nodes. */
  children: React.ReactNode
  className?: string
}

/**
 * The repeatable "info icon" pattern: a small, focusable `[i]` button that
 * reveals a tooltip on hover or keyboard focus. Self-contained (renders its own
 * `TooltipProvider`) so it works anywhere — inside a `Field.Label` or beside any
 * standalone label — in both the public and dashboard apps.
 *
 * The trigger cancels its own click so that, when nested inside a `<label>`, it
 * does not proxy the click to the associated control.
 */
export function InfoTooltip({ 'aria-label': ariaLabel, children, className }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={ariaLabel}
            data-info-tooltip-trigger=""
            onClick={(event) => event.preventDefault()}
            className={cn(
              'inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              className,
            )}
          >
            <Info className="size-3.5" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
