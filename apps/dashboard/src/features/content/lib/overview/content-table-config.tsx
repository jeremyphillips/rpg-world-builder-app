import { formatEquipmentCostLabel, moneyToCp, type EquipmentCost } from '@rpg/contracts'
import { dataTableColumnMeta, dataTableWidthMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import {
  buildNameColumn,
  buildSourceColumn,
  stampDataColumns,
} from '@/lib/data-table/column-builders'

import { getContentImageUrl } from '../detail/content-image-url'
import { CONTENT_SOURCE_BADGE, type ContentSource } from './content-source-badge'

/**
 * Minimum shape every content type shares. Used to constrain the generic
 * so the shared image, name, and source columns are type-safe.
 */
export type ContentBase = {
  imageKey?: string
  name: string
  source: ContentSource
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

type WithCost = { cost: EquipmentCost }

const NO_MARKET_PRICE_LABEL = 'No market price'

/** Sortable cost column shared by armor, equipment, and weapon overview tables. */
export function costColumn<T extends WithCost>(): ColumnDef<T> {
  return {
    id: 'cost',
    accessorFn: (row) => (row.cost ? moneyToCp(row.cost) : -1),
    header: ({ column }) => <SortableHeader column={column}>Cost</SortableHeader>,
    cell: ({ row }) => formatEquipmentCostLabel(row.original.cost) ?? NO_MARKET_PRICE_LABEL,
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
          className="size-8 shrink-0 rounded-md object-cover"
        />
      )
    },
    enableSorting: false,
    enableHiding: false,
    meta: {
      ...dataTableColumnMeta.identity,
      ...dataTableWidthMeta('image'),
      label: 'Image',
      locked: true,
    },
  }

  const nameColumn = buildNameColumn<T>({
    accessorKey: 'name',
    locked: true,
    nameHref,
  })

  const sourceColumn = buildSourceColumn<T, ContentSource>({
    badgeMap: CONTENT_SOURCE_BADGE,
  })

  return [imageColumn, nameColumn, ...stampDataColumns(middleColumns), sourceColumn]
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
