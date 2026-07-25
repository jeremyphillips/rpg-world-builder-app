import type { ColumnDef } from '@rpg/ui'

import type { CatalogOverviewColumnSchema } from './catalog-overview-preferences'

function resolveColumnId(column: ColumnDef<unknown>): string | undefined {
  const candidate = column as { id?: string; accessorKey?: string }
  return (
    candidate.id ?? (typeof candidate.accessorKey === 'string' ? candidate.accessorKey : undefined)
  )
}

/** Derives preference column metadata from catalog overview column definitions. */
export function buildCatalogOverviewColumnSchema(
  columns: ColumnDef<unknown>[],
): CatalogOverviewColumnSchema {
  const ids = columns
    .map((column) => resolveColumnId(column))
    .filter((id): id is string => Boolean(id))

  const lockedIds = columns
    .filter((column) => column.meta?.locked)
    .map((column) => resolveColumnId(column))
    .filter((id): id is string => Boolean(id))

  return { ids, lockedIds }
}
