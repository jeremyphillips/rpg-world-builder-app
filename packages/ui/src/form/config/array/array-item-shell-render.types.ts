import type { ReactNode } from 'react'
import type { useSortable } from '@dnd-kit/sortable'

import type { ResolvedArrayItemHeader } from './array-item-config.lib'

/**
 * Props passed to `ArrayItemConfig.renderShell` when a consumer replaces the
 * default ArrayItem presentation shell (e.g. dashboard entity-backed grants →
 * DisclosureEntityCard). Form ownership of registration, remove/reorder, and
 * validation chrome stays here; the shell owns visual card anatomy only.
 */
export type ArrayItemShellRenderProps = {
  itemId: string
  itemPrefix: string
  titleId: string
  index: number
  header: ResolvedArrayItemHeader
  itemValues: Record<string, unknown>
  /** Resolved detailed-item summary line (empty when none). */
  summary?: string
  collapsed: boolean
  onToggleCollapse: () => void
  dragHandleProps?: {
    attributes: ReturnType<typeof useSortable>['attributes']
    listeners: ReturnType<typeof useSortable>['listeners']
    isDragging: boolean
  }
  /** Trailing controls (issue badge + remove) — place via surface `action`. */
  action: ReactNode
  /** Registered item fields — place as disclosure body children. */
  children: ReactNode
}
