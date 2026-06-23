import { Link } from 'react-router-dom'
import { formatMoney, moneyToCp, type Money } from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { getContentImageUrl } from './content-image-url'

/**
 * Minimum shape every content type shares. Used to constrain the generic
 * so the shared image, name, and source columns are type-safe.
 */
export type ContentBase = {
  imageKey?: string
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

export type ContentTableOptions<T> = {
  /** When provided, the name cell renders as a link to this href. */
  nameHref?: (row: T) => string
}

type WithCost = { cost: Money }

/** Sortable cost column shared by armor, equipment, and weapon overview tables. */
export function costColumn<T extends WithCost>(): ColumnDef<T> {
  return {
    id: 'cost',
    accessorFn: (row) => moneyToCp(row.cost),
    header: ({ column }) => <SortableHeader column={column}>Cost</SortableHeader>,
    cell: ({ row }) => formatMoney(row.original.cost),
    meta: { label: 'Cost' },
  }
}

/**
 * Wraps content-specific columns with the shared image + name (prepended) and
 * source (appended) columns. Every content overview uses this to stay consistent.
 *
 * Pass `options.nameHref` to make the name cell a navigable link.
 *
 * @example
 * const columns = buildContentColumns<CharacterClass>([hitDieCol, spellcastingCol], {
 *   nameHref: (row) => ROUTES.content.classes.detail(campaignId, row.id),
 * })
 */
export function buildContentColumns<T extends ContentBase>(
  middleColumns: ColumnDef<T>[],
  options?: ContentTableOptions<T>,
): ColumnDef<T>[] {
  const { nameHref } = options ?? {}

  const imageColumn: ColumnDef<T> = {
    accessorKey: 'imageKey',
    header: () => <span className="sr-only">Image</span>,
    cell: ({ row }) => {
      const key = row.getValue<string | undefined>('imageKey')
      return (
        <img
          src={getContentImageUrl(key)}
          alt=""
          aria-hidden="true"
          className="size-9 shrink-0 rounded-md object-cover"
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
    meta: { headerClassName: 'w-16', cellClassName: 'w-16', label: 'Image', locked: true },
  }

  const nameColumn: ColumnDef<T> = {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: nameHref
      ? ({ row }) => (
          <Link
            to={nameHref(row.original)}
            className="font-medium hover:underline focus-visible:underline"
          >
            {row.getValue<string>('name')}
          </Link>
        )
      : undefined,
    enableHiding: false,
    meta: { label: 'Name', locked: true },
  }

  const sourceColumn: ColumnDef<T> = {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => <span className="capitalize">{row.getValue<string>('source')}</span>,
    enableSorting: false,
    meta: { label: 'Source' },
  }

  return [imageColumn, nameColumn, ...middleColumns, sourceColumn]
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
