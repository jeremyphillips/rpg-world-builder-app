import { SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

/**
 * Minimum shape every content type shares. Used to constrain the generic
 * so the shared name and source columns are type-safe.
 */
export type ContentBase = {
  name: string
  source: 'system' | 'homebrew'
}

const BASE_NAME_FILTER: FilterDef = {
  type: 'text',
  id: 'name',
  label: 'Name',
  placeholder: 'Search…',
}

const BASE_SOURCE_FILTER: FilterDef = {
  type: 'select',
  id: 'source',
  label: 'Source',
  options: [
    { label: 'System', value: 'system' },
    { label: 'Homebrew', value: 'homebrew' },
  ],
  group: 'secondary',
}

/**
 * Wraps content-specific columns with the shared name (prepended) and source
 * (appended) columns. Every content overview uses this to stay consistent.
 *
 * @example
 * const columns = buildContentColumns<CharacterClass>([hitDieCol, spellcastingCol])
 */
export function buildContentColumns<T extends ContentBase>(
  middleColumns: ColumnDef<T>[],
): ColumnDef<T>[] {
  const nameColumn: ColumnDef<T> = {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
  }

  const sourceColumn: ColumnDef<T> = {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => <span className="capitalize">{row.getValue<string>('source')}</span>,
    enableSorting: false,
  }

  return [nameColumn, ...middleColumns, sourceColumn]
}

/**
 * Wraps content-specific filters with the shared name text filter (prepended,
 * primary) and source select filter (appended, secondary). Every content
 * overview uses this to stay consistent.
 *
 * @example
 * const filters = buildContentFilters([hitDieFilter, spellcastingFilter])
 */
export function buildContentFilters(contentFilters: FilterDef[]): FilterDef[] {
  return [BASE_NAME_FILTER, ...contentFilters, BASE_SOURCE_FILTER]
}
