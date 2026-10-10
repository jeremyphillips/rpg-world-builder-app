import { cn } from '../../lib/utils'
import type { FieldSizeToken } from './field-sizing.variants'
import {
  resolveFieldGroupSegmentShellClasses,
  resolveFieldGroupSizeClass,
  UI_FIELD_GROUP_VALUE_SLOT_END_CLASS,
  UI_FIELD_GROUP_VALUE_SLOT_END_SLOT_CLASS,
  UI_FIELD_GROUP_VALUE_SLOT_MIDDLE_CLASS,
  UI_FIELD_GROUP_VALUE_SLOT_STANDALONE_CLASS,
  UI_FIELD_GROUP_VALUE_SLOT_STANDALONE_SLOT_CLASS,
  UI_FIELD_GROUP_VALUE_SLOT_START_CLASS,
  UI_FIELD_GROUP_VALUE_SLOT_START_COMPACT_CLASS,
} from './field-group.styles'
import { groupedDividerVariants } from './field-input-chrome.variants'
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
  const sizeClass = resolveFieldGroupSizeClass(size)

  if (position === 'standalone') {
    return cn(
      sizeClass,
      trailing === 'slot'
        ? UI_FIELD_GROUP_VALUE_SLOT_STANDALONE_SLOT_CLASS
        : UI_FIELD_GROUP_VALUE_SLOT_STANDALONE_CLASS,
    )
  }

  switch (position) {
    case 'start':
      return cn(
        sizeClass,
        options.inset === 'compact'
          ? UI_FIELD_GROUP_VALUE_SLOT_START_COMPACT_CLASS
          : UI_FIELD_GROUP_VALUE_SLOT_START_CLASS,
      )
    case 'middle':
      return cn(sizeClass, UI_FIELD_GROUP_VALUE_SLOT_MIDDLE_CLASS)
    case 'end':
      return cn(
        sizeClass,
        trailing === 'slot'
          ? UI_FIELD_GROUP_VALUE_SLOT_END_SLOT_CLASS
          : UI_FIELD_GROUP_VALUE_SLOT_END_CLASS,
      )
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
  return resolveFieldGroupSegmentShellClasses(size, {
    position: options.position,
    surfaceFaint: options.surface === 'faint',
  })
}

export { groupedDividerVariants }
export type { GroupedDividerVariantProps } from './field-input-chrome.variants'
