import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '../../lib/utils'

import { dividedStackVariants, type DividedStackVariantProps } from './divided-stack.variants'

export type DividedStackProps = ComponentPropsWithoutRef<'div'> & DividedStackVariantProps

/**
 * Stacks direct children with a subtle top border and balanced spacing on each
 * sibling after the first. Each logical row must be a single DOM child — React
 * fragments or multiple roots per row add extra dividers.
 */
export function DividedStack({ density, className, children, ...props }: DividedStackProps) {
  return (
    <div
      data-slot="divided-stack"
      className={cn(dividedStackVariants({ density }), className)}
      {...props}
    >
      {children}
    </div>
  )
}
