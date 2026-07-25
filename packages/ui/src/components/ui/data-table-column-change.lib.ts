import type { VisibilityState } from '@tanstack/react-table'

import type { ColumnChangeState } from './data-table.types'

const INTERNAL_COLUMN_IDS = new Set(['select', 'actions'])

/** Column ids injected by DataTable — excluded from persisted preferences. */
export function isInternalDataTableColumnId(id: string): boolean {
  return INTERNAL_COLUMN_IDS.has(id)
}

/** Normalizes visibility for persistence and equality checks. */
export function normalizeColumnVisibilityForPersist(visibility: VisibilityState): VisibilityState {
  const normalized: VisibilityState = {}

  for (const id of Object.keys(visibility).sort()) {
    if (isInternalDataTableColumnId(id)) continue
    const visible = visibility[id]
    if (visible !== undefined) {
      normalized[id] = visible
    }
  }

  return normalized
}

/** Normalizes order for persistence and equality checks. */
export function normalizeColumnOrderForPersist(order: readonly string[]): string[] {
  return order.filter((id) => !isInternalDataTableColumnId(id))
}

/** Builds the persisted column-change payload from table state. */
export function createPersistedColumnChangeState(
  visibility: VisibilityState,
  order: readonly string[],
): ColumnChangeState {
  return {
    visibility: normalizeColumnVisibilityForPersist(visibility),
    order: normalizeColumnOrderForPersist(order),
  }
}

/** Stable snapshot for deduping parent notifications. */
export function createColumnChangeSnapshot(state: ColumnChangeState): string {
  return JSON.stringify({
    visibility: normalizeColumnVisibilityForPersist(state.visibility ?? {}),
    order: normalizeColumnOrderForPersist(state.order ?? []),
  })
}

export function areColumnChangeStatesEqual(
  left: ColumnChangeState,
  right: ColumnChangeState,
): boolean {
  return createColumnChangeSnapshot(left) === createColumnChangeSnapshot(right)
}

export function areVisibilityStatesEqual(left: VisibilityState, right: VisibilityState): boolean {
  return (
    createColumnChangeSnapshot({ visibility: left, order: [] }) ===
    createColumnChangeSnapshot({ visibility: right, order: [] })
  )
}

export function areColumnOrdersEqual(left: readonly string[], right: readonly string[]): boolean {
  const normalizedLeft = normalizeColumnOrderForPersist(left)
  const normalizedRight = normalizeColumnOrderForPersist(right)
  if (normalizedLeft.length !== normalizedRight.length) return false
  return normalizedLeft.every((id, index) => id === normalizedRight[index])
}

export type ResolveDataTableColumnOrderOptions = {
  order: readonly string[]
  enableRowSelection: boolean
  hasActions: boolean
}

/** Injects `select` / `actions` into a persisted user order when those columns mount. */
export function resolveDataTableColumnOrder({
  order,
  enableRowSelection,
  hasActions,
}: ResolveDataTableColumnOrderOptions): string[] {
  if (order.length === 0) return []

  const userOrder = order.filter((id) => !isInternalDataTableColumnId(id))
  const prefix = enableRowSelection ? ['select'] : []
  const suffix = hasActions ? ['actions'] : []

  return [...prefix, ...userOrder, ...suffix]
}
