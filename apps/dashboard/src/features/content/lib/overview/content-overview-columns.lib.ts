import type { ColumnDef } from '@rpg/ui'

import type { ContentOverviewColumnSchema } from './content-overview-preferences'

function resolveColumnId(column: ColumnDef<unknown>): string | undefined {
  const candidate = column as { id?: string; accessorKey?: string }
  return candidate.id ?? (typeof candidate.accessorKey === 'string' ? candidate.accessorKey : undefined)
}

/** Derives preference column metadata from overview column definitions. */
export function buildContentOverviewColumnSchema(
  columns: ColumnDef<unknown>[],
): ContentOverviewColumnSchema {
  const ids = columns
    .map((column) => resolveColumnId(column))
    .filter((id): id is string => Boolean(id))

  const lockedIds = columns
    .filter((column) => column.meta?.locked)
    .map((column) => resolveColumnId(column))
    .filter((id): id is string => Boolean(id))

  return { ids, lockedIds }
}

/** Collects sortable column ids for overview query state. */
export function getContentOverviewSortableColumnIds(
  columns: ColumnDef<unknown>[],
): string[] {
  return columns
    .filter((column) => column.enableSorting !== false)
    .map((column) => resolveColumnId(column))
    .filter((id): id is string => Boolean(id))
}
