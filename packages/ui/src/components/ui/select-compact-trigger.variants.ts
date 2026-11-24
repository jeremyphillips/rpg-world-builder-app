import { cn } from '../../lib/utils'
import type { FieldDigits } from './field-digit-metrics'
import type { FieldSize } from './field-root.lib'
import { fieldSizeTypographyClasses } from './field-sizing.variants'
import {
  fieldControlTriggerCursorClasses,
  fieldControlTriggerVariants,
} from './field-control.variants'
import { resolveFieldGroupCaretSlotClass, resolveFieldGroupSizeClass } from './field-group.styles'
import {
  groupedSegmentShellClasses,
  resolveGroupedSegmentSurface,
  resolveGroupedValueSlotPadding,
  type GroupedSegmentPosition,
  type GroupedSegmentSurface,
  type GroupedSurfaceRole,
  type GroupedValueSlotPosition,
  type GroupedValueSlotTrailing,
} from './grouped-segment.variants'

export const selectDigitValueMinWidthVariants = {
  1: 'min-w-[calc(1*1ch)]',
  2: 'min-w-[calc(2*1ch)]',
  3: 'min-w-[calc(3*1ch)]',
  4: 'min-w-[calc(4*1ch)]',
  5: 'min-w-[calc(5*1ch)]',
} as const satisfies Record<FieldDigits, string>

const selectValueSlotGridClasses = 'grid items-center'

const SELECT_VALUE_SLOT_GHOST =
  'invisible col-start-1 row-start-1 whitespace-nowrap pointer-events-none select-none'

const SELECT_VALUE_SLOT_OVERLAY = 'col-start-1 row-start-1 min-w-0 truncate text-left'

export type { GroupedValueSlotPosition, GroupedValueSlotTrailing }

/** Grouped select segment shell — height, corners, wash; no padding. */
export function groupedSelectSegmentShellClasses(
  size: FieldSize,
  position: Extract<GroupedSegmentPosition, 'start' | 'end'>,
  options: {
    surface?: GroupedSegmentSurface
    surfaceRole?: GroupedSurfaceRole
  } = {},
): string {
  const surface = options.surface ?? resolveGroupedSegmentSurface(options.surfaceRole ?? 'value')

  return groupedSegmentShellClasses(size, { position, surface })
}

/** Grouped fixed-label segment shell — height, end wash; no padding. */
export function groupedEndLabelSegmentShellClasses(size: FieldSize): string {
  return groupedSegmentShellClasses(size, {
    position: 'end',
    surface: resolveGroupedSegmentSurface('unit'),
  })
}

/** Shell classes — border, radius, bg, focus; no padding. */
export function selectTriggerShellClasses(
  size: FieldSize,
  options: { grouped: boolean; groupedPosition: 'start' | 'end' },
): string {
  if (options.grouped) {
    return cn(
      groupedSelectSegmentShellClasses(size, options.groupedPosition, {
        surfaceRole: options.groupedPosition === 'end' ? 'unit' : 'value',
      }),
      fieldControlTriggerCursorClasses,
    )
  }

  return cn(fieldControlTriggerVariants({ size }), 'items-stretch')
}

export function groupedValueSlotClasses(
  size: FieldSize,
  options: {
    position: GroupedValueSlotPosition
    trailing?: GroupedValueSlotTrailing
    digits?: FieldDigits
    textSizing?: boolean
    prose?: boolean
  },
): string {
  const padding = resolveGroupedValueSlotPadding(size, options.position, {
    trailing: options.trailing,
  })

  if (options.digits != null) {
    return cn(
      'flex shrink-0 items-center text-left tabular-nums',
      padding,
      selectDigitValueMinWidthVariants[options.digits],
    )
  }

  if (options.textSizing) {
    return cn(padding, selectValueSlotGridClasses, 'shrink-0 items-center')
  }

  return cn(
    'flex min-h-0 min-w-0 w-full items-center text-left',
    padding,
    options.prose && 'flex-1',
  )
}

export function selectValueSlotGhostClasses(size: FieldSize): string {
  return cn(SELECT_VALUE_SLOT_GHOST, fieldSizeTypographyClasses[size])
}

export function selectValueSlotOverlayClasses(): string {
  return SELECT_VALUE_SLOT_OVERLAY
}

export function selectCaretSlotClasses(
  size: FieldSize,
  options: { groupedStart: boolean },
): string {
  return cn(
    resolveFieldGroupSizeClass(size),
    resolveFieldGroupCaretSlotClass({ groupedStart: options.groupedStart }),
  )
}
