'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

import { cn } from '../../lib/utils'
import { PopoverLayerPortal } from './layer-portal-container.client'
import {
  overlayArrowHeight,
  overlayArrowPath,
  overlayArrowWidth,
  popoverContentMotionClasses,
  popoverContentVariants,
} from './popover-content.variants'

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

type PopoverContentProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
  arrow?: boolean
}

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    {
      className,
      align = 'center',
      // Radix main-axis offset is `sideOffset + arrowHeight`. This is the gap past the tip.
      sideOffset = 4,
      arrow = false,
      children,
      ...props
    },
    ref,
  ) => (
    <PopoverLayerPortal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          popoverContentVariants({ tone: 'popover' }),
          popoverContentMotionClasses,
          arrow && 'ui-popover-content--with-arrow',
          className,
        )}
        {...props}
      >
        {children}
        {arrow ? (
          <PopoverPrimitive.Arrow asChild width={overlayArrowWidth} height={overlayArrowHeight}>
            <svg
              className="ui-overlay-arrow"
              viewBox={`0 0 ${overlayArrowWidth} ${overlayArrowHeight}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <rect x="3.5" y="0" width="13" height="3" fill="var(--popover)" stroke="none" />
              <path
                d={overlayArrowPath}
                fill="var(--popover)"
                stroke="var(--border)"
                strokeWidth={1}
                strokeLinejoin="round"
              />
            </svg>
          </PopoverPrimitive.Arrow>
        ) : null}
      </PopoverPrimitive.Content>
    </PopoverLayerPortal>
  ),
)
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
