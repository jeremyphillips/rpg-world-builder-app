'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { Info } from 'lucide-react'

import { cn } from '../../lib/utils'
import { popoverContentVariants, tooltipContentMotionClasses } from './popover-content.variants'
import { tooltipTriggerCursorVariants } from './tooltip-trigger.variants'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

export type TooltipTriggerProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Trigger
> & {
  /** Real control (button/link). Default false = passive info trigger. */
  interactive?: boolean
}

const TooltipTrigger = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Trigger>,
  TooltipTriggerProps
>(({ className, interactive = false, ...props }, ref) => (
  <TooltipPrimitive.Trigger
    ref={ref}
    className={cn(tooltipTriggerCursorVariants({ interactive }), className)}
    {...props}
  />
))
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        popoverContentVariants({ tone: 'tooltip' }),
        tooltipContentMotionClasses,
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
        <TooltipTrigger interactive asChild>
          <button
            type="button"
            aria-label={ariaLabel}
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
