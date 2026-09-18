'use client'

import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import { fieldSelectInlineCaretIconClasses } from './select-caret.variants'
import {
  groupedValueSlotClasses,
  selectCaretSlotClasses,
  selectValueSlotGhostClasses,
  selectValueSlotOverlayClasses,
  type GroupedValueSlotPosition,
  type GroupedValueSlotTrailing,
} from './select-compact-trigger.variants'
import {
  SELECT_CARET_SLOT_DATA_ATTR,
  SELECT_SIZING_LABEL_DATA_ATTR,
  SELECT_VALUE_SLOT_DATA_ATTR,
} from './select-trigger.lib'

export function SelectLikeSizingGhosts({
  size,
  labels,
}: {
  size: FieldSize
  labels: readonly string[]
}) {
  return labels.map((label) => (
    <span
      key={label}
      {...{ [SELECT_SIZING_LABEL_DATA_ATTR]: '' }}
      aria-hidden
      className={selectValueSlotGhostClasses(size)}
    >
      {label}
    </span>
  ))
}

export function SelectLikeValueSlot({
  size,
  position,
  /** @deprecated Prefer `position`. */
  edge,
  trailing,
  /** Shorthand for `trailing="slot"` when a sibling trailing column follows. */
  trailingSlot,
  digits,
  textSizing,
  prose,
  sizingGhostLabels,
  children,
  className,
}: {
  size: FieldSize
  position?: GroupedValueSlotPosition
  edge?: GroupedValueSlotPosition
  trailing?: GroupedValueSlotTrailing
  trailingSlot?: boolean
  digits?: Parameters<typeof groupedValueSlotClasses>[1]['digits']
  textSizing?: boolean
  prose?: boolean
  sizingGhostLabels?: readonly string[]
  children: ReactNode
  className?: string
}) {
  const resolvedPosition = position ?? edge ?? 'standalone'
  const resolvedTrailing = trailingSlot ? 'slot' : (trailing ?? 'content')
  const resolvedTextSizing =
    textSizing ?? (sizingGhostLabels != null && sizingGhostLabels.length > 0)

  return (
    <span
      {...{ [SELECT_VALUE_SLOT_DATA_ATTR]: '' }}
      className={cn(
        groupedValueSlotClasses(size, {
          position: resolvedPosition,
          trailing: resolvedTrailing,
          digits,
          textSizing: resolvedTextSizing,
          prose,
        }),
        className,
      )}
    >
      {resolvedTextSizing && sizingGhostLabels != null && sizingGhostLabels.length > 0 ? (
        <>
          <SelectLikeSizingGhosts size={size} labels={sizingGhostLabels} />
          <span className={selectValueSlotOverlayClasses()}>{children}</span>
        </>
      ) : (
        children
      )}
    </span>
  )
}

export function SelectLikeCaretSlot({
  size,
  groupedStart = false,
  children,
}: {
  size: FieldSize
  groupedStart?: boolean
  children?: ReactNode
}) {
  return (
    <span
      {...{ [SELECT_CARET_SLOT_DATA_ATTR]: '' }}
      aria-hidden
      className={selectCaretSlotClasses(size, { groupedStart })}
    >
      {children ?? (
        <ChevronDown
          className={cn(fieldSelectInlineCaretIconClasses(size), 'block shrink-0 opacity-50')}
        />
      )}
    </span>
  )
}
