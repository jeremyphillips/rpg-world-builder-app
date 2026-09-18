'use client'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import {
  groupedDividerVariants,
  groupedSegmentShellClasses,
  resolveGroupedSegmentSurface,
  resolveGroupedValueSlotPadding,
  type GroupedDividerStrength,
  type GroupedSegmentPosition,
  type GroupedSegmentSurface,
  type GroupedSurfaceRole,
  type GroupedValueSlotInset,
} from './grouped-segment.variants'

export interface GroupedDividerProps {
  strength?: GroupedDividerStrength
  className?: string
}

/** Vertical divider between grouped segments — boundary strength, not surface role. */
export function GroupedDivider({ strength = 'primary', className }: GroupedDividerProps) {
  return <div aria-hidden className={cn(groupedDividerVariants({ strength }), className)} />
}

export interface GroupedStaticSegmentProps {
  size: FieldSize
  position: GroupedSegmentPosition
  /** Explicit shell surface — prefer {@link surfaceRole} at compose sites. */
  surface?: GroupedSegmentSurface
  /** Chromatic role → surface when `surface` is omitted (default `value`). */
  surfaceRole?: GroupedSurfaceRole
  /** `compact` for static prefix glyphs; `default` for full outer-start inset. */
  inset?: GroupedValueSlotInset
  /** Mono weight for dice notation glyphs (`d`, operators). */
  mono?: boolean
  children: ReactNode
  className?: string
}

/** Non-interactive grouped segment (dice glue, static operators, fixed glyphs). */
export function GroupedStaticSegment({
  size,
  position,
  surface,
  surfaceRole = 'value',
  inset = 'default',
  mono = false,
  children,
  className,
}: GroupedStaticSegmentProps) {
  const resolvedSurface = surface ?? resolveGroupedSegmentSurface(surfaceRole)

  return (
    <span
      aria-hidden
      className={cn(
        groupedSegmentShellClasses(size, { position, surface: resolvedSurface }),
        className,
      )}
    >
      <span
        className={cn(
          resolveGroupedValueSlotPadding(size, position, { trailing: 'content', inset }),
          'flex items-center tabular-nums',
          mono && 'font-mono font-medium',
        )}
      >
        {children}
      </span>
    </span>
  )
}
