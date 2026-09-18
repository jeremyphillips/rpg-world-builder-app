import { cn } from '../../lib/utils'
import type { FieldDigits } from './field-digit-metrics'
import type { FieldSize } from './field-root.lib'
import type { FieldSizeToken } from './field-sizing.variants'
import { fieldSizeTypographyClasses } from './field-sizing.variants'
import { fieldControlVariants } from './field-control.variants'
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

/** Fixed caret column width — shared by compact and prose select triggers. */
export const selectCaretSlotWidthClasses = {
  sm: 'w-8',
  md: 'w-8',
  lg: 'w-9',
} as const satisfies Record<FieldSizeToken, string>

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

/** @deprecated Prefer `GroupedValueSlotPosition`. */
export type GroupedValueSlotEdge = GroupedValueSlotPosition

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
    return groupedSelectSegmentShellClasses(size, options.groupedPosition, {
      surfaceRole: options.groupedPosition === 'end' ? 'unit' : 'value',
    })
  }

  return cn(fieldControlVariants({ size }), 'inline-flex shrink-0 items-stretch px-0 py-0')
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

  return cn('flex min-h-0 min-w-0 items-center text-left', padding, options.prose && 'flex-1')
}

/** @deprecated Use `groupedValueSlotClasses` — alias for select ValueSlot padding. */
export function selectValueSlotClasses(
  size: FieldSize,
  options: {
    digits?: FieldDigits
    sizingLabel?: string
    sizingLabels?: readonly string[]
    prose?: boolean
    grouped?: boolean
    groupedPosition?: 'start' | 'end'
    trailing?: GroupedValueSlotTrailing
  },
): string {
  const position: GroupedValueSlotPosition = options.grouped
    ? options.groupedPosition === 'end'
      ? 'end'
      : 'start'
    : 'standalone'

  const textSizing =
    (options.sizingLabel != null && options.sizingLabel.length > 0) ||
    (options.sizingLabels != null && options.sizingLabels.length > 0)

  const trailing =
    options.trailing ??
    (options.grouped && options.groupedPosition === 'end'
      ? 'slot'
      : !options.grouped
        ? 'slot'
        : 'content')

  return groupedValueSlotClasses(size, {
    position,
    trailing,
    digits: options.digits,
    textSizing,
    prose: options.prose,
  })
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
    'pointer-events-none flex shrink-0 items-center justify-center self-stretch leading-none text-muted-foreground',
    selectCaretSlotWidthClasses[size],
    options.groupedStart && 'pe-1',
  )
}
