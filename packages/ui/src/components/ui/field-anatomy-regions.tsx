import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import {
  fieldControlRegionClasses,
  fieldLabelRegionVariants,
  fieldMessageRegionVariants,
} from './field.variants'

export interface FieldAnatomyRegionProps extends HTMLAttributes<HTMLDivElement> {
  size?: FieldSize
  children?: ReactNode
}

/**
 * Label region of the flat three-region field anatomy.
 * Always rendered (including empty) so row subgrid tracks stay stable.
 * Bottom padding applies only when the region has element children (`has-[*]`).
 */
export function FieldLabelRegion({
  size = 'md',
  className,
  children,
  ...props
}: FieldAnatomyRegionProps) {
  return (
    <div
      data-field-label-region=""
      className={cn(fieldLabelRegionVariants({ size }), className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Control region of the flat three-region field anatomy.
 * Hosts the control band (and inline toggle rows).
 */
export function FieldControlRegion({
  className,
  children,
  ...props
}: Omit<FieldAnatomyRegionProps, 'size'>) {
  return (
    <div
      data-field-control-region=""
      className={cn(fieldControlRegionClasses, className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Message region of the flat three-region field anatomy.
 * Hosts derived meta, below-control hints, and validation errors.
 * Top padding applies only when the region has element children (`has-[*]`).
 */
export function FieldMessageRegion({
  size = 'md',
  className,
  children,
  ...props
}: FieldAnatomyRegionProps) {
  return (
    <div
      data-field-message-region=""
      className={cn(fieldMessageRegionVariants({ size }), className)}
      {...props}
    >
      {children}
    </div>
  )
}
