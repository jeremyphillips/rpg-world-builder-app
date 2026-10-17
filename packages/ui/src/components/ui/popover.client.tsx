'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import * as React from 'react'

import { cn } from '../../lib/utils'
import { PopoverLayerPortal } from './layer-portal-container.client'
import { OverlayArrowSvg, overlayArrowHeight, overlayArrowWidth } from './overlay-arrow.client'
import { popoverContentMotionClasses, popoverContentVariants } from './popover-content.variants'

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
            <OverlayArrowSvg fill="var(--popover)" />
          </PopoverPrimitive.Arrow>
        ) : null}
      </PopoverPrimitive.Content>
    </PopoverLayerPortal>
  ),
)
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
