import { cn } from '../../lib/utils'
import {
  fieldGroupedControlHeightClasses,
  fieldGroupedValueSlotBeforeTrailingSlotPaddingClasses,
  fieldGroupedValueSlotEndContentPaddingClasses,
  fieldGroupedValueSlotEndTrailingSlotPaddingClasses,
  fieldGroupedValueSlotMiddlePaddingClasses,
  fieldGroupedValueSlotStartCompactPaddingClasses,
  fieldGroupedValueSlotStartPaddingClasses,
  fieldSizeTypographyClasses,
  type FieldSizeToken,
} from './field-sizing.variants'
import {
  fieldGroupedEndSegmentSurfaceClasses,
  fieldGroupedSegmentEndClasses,
  fieldGroupedSegmentResetClasses,
  fieldGroupedSegmentStartClasses,
  groupedDividerVariants,
} from './field-input-chrome.variants'
import type { FieldSize } from './field.client'

export type GroupedSegmentPosition = 'start' | 'middle' | 'end'
export type GroupedSegmentSurface = 'default' | 'faint'
export type GroupedSurfaceRole = 'value' | 'unit' | 'glue'
export type GroupedValueSlotInset = 'default' | 'compact'
export type GroupedDividerStrength = 'primary' | 'subtle'
export type GroupedValueSlotPosition = GroupedSegmentPosition | 'standalone'
export type GroupedValueSlotTrailing = 'content' | 'slot'

const GROUPED_SEGMENT_POSITIONS = [
  'start',
  'middle',
  'end',
] as const satisfies readonly GroupedSegmentPosition[]

const GROUPED_SURFACE_ROLE_TO_SURFACE = {
  value: 'default',
  unit: 'faint',
  glue: 'faint',
} as const satisfies Record<GroupedSurfaceRole, GroupedSegmentSurface>

export function isGroupedSegmentPosition(value: string): value is GroupedSegmentPosition {
  return (GROUPED_SEGMENT_POSITIONS as readonly string[]).includes(value)
}

/** Maps chromatic role → shell surface. Composition helper — not positional. */
export function resolveGroupedSegmentSurface(role: GroupedSurfaceRole): GroupedSegmentSurface {
  return GROUPED_SURFACE_ROLE_TO_SURFACE[role]
}

/**
 * Positional value-slot padding — `trailing: 'slot'` when a sibling trailing column follows;
 * `inset: 'compact'` for static prefix glyphs at the outer start edge.
 */
export function resolveGroupedValueSlotPadding(
  size: FieldSizeToken,
  position: GroupedValueSlotPosition,
  options: { trailing?: GroupedValueSlotTrailing; inset?: GroupedValueSlotInset } = {},
): string {
  const trailing = options.trailing ?? 'content'

  if (position === 'standalone') {
    return trailing === 'slot'
      ? cn(
          fieldGroupedValueSlotStartPaddingClasses[size],
          fieldGroupedValueSlotBeforeTrailingSlotPaddingClasses[size],
        )
      : fieldGroupedValueSlotStartPaddingClasses[size]
  }

  switch (position) {
    case 'start':
      return options.inset === 'compact'
        ? fieldGroupedValueSlotStartCompactPaddingClasses[size]
        : fieldGroupedValueSlotStartPaddingClasses[size]
    case 'middle':
      return fieldGroupedValueSlotMiddlePaddingClasses[size]
    case 'end':
      return trailing === 'slot'
        ? fieldGroupedValueSlotEndTrailingSlotPaddingClasses[size]
        : fieldGroupedValueSlotEndContentPaddingClasses[size]
  }
}

/** @deprecated Prefer `resolveGroupedValueSlotPadding`. */
export function groupedValueSlotPaddingClasses(
  size: FieldSizeToken,
  position: GroupedSegmentPosition,
): string {
  return resolveGroupedValueSlotPadding(size, position)
}

/** Segment shell — geometry (height, corners) + explicit surface; position does not imply wash. */
export function groupedSegmentShellClasses(
  size: FieldSize,
  options: {
    position: GroupedSegmentPosition
    surface: GroupedSegmentSurface
  },
): string {
  const cornerClasses =
    options.position === 'start'
      ? cn(fieldGroupedSegmentResetClasses, fieldGroupedSegmentStartClasses)
      : options.position === 'end'
        ? cn(fieldGroupedSegmentResetClasses, fieldGroupedSegmentEndClasses)
        : fieldGroupedSegmentResetClasses

  return cn(
    fieldGroupedControlHeightClasses[size],
    fieldSizeTypographyClasses[size],
    cornerClasses,
    options.surface === 'faint' && fieldGroupedEndSegmentSurfaceClasses,
    'inline-flex shrink-0 items-stretch p-0',
  )
}

export { groupedDividerVariants }
export type { GroupedDividerVariantProps } from './field-input-chrome.variants'
