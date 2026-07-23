import {
  CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  formatEquipmentCostLabel,
  moneyToCp,
  type ContentStatus,
  type EquipmentCost,
  type ResolvedContentCampaignAccess,
  type WithCampaignAccess,
} from '@rpg/contracts'
import {
  DataTableImageCell,
  dataTableColumnMeta,
  dataTableNameLinkCellVariants,
  dataTableWidthMeta,
  SortableHeader,
} from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { buildSourceColumn, stampDataColumns } from '@/lib/data-table/column-builders'

import {
  CAMPAIGN_ACCESS_TABLE_FILTER_ALL,
  CAMPAIGN_ACCESS_TABLE_FILTER_AVAILABLE,
  CAMPAIGN_ACCESS_TABLE_FILTER_LABEL,
  CAMPAIGN_ACCESS_TABLE_FILTER_UNAVAILABLE,
} from '../campaign-access/campaign-access-table-labels'
import { getContentImageUrl } from '../detail/content-image-url'
import { CONTENT_SOURCE_BADGE, type ContentSource } from './content-source-badge'
import { CONTENT_STATUS_BADGE } from './content-status-badge'
import { ContentStatusNameBadge } from './content-status-name-badge.client'
import {
  CAMPAIGN_AVAILABILITY_FILTER_ID,
  campaignAvailabilityFilterFn,
} from './content-availability-table.lib'
import { ContentNameCellMetadata } from './content-name-cell-metadata.client'

/**
 * Minimum shape every content type shares. Used to constrain the generic
 * so the shared image, name, and source columns are type-safe.
 */
export type ContentBase = {
  imageKey?: string
  name: string
  source: ContentSource
  status: ContentStatus
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

const BASE_STATUS_FILTER: FilterDef = {
  type: 'select',
  id: 'status',
  label: 'Status',
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
  ],
  group: 'secondary',
}

function readCampaignAccess(row: ContentBase): ResolvedContentCampaignAccess {
  return (row as WithCampaignAccess<ContentBase>).campaignAccess ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS
}

function buildCampaignAvailabilityFilter<T extends ContentBase>(): FilterDef<T> {
  return {
    type: 'select',
    id: CAMPAIGN_AVAILABILITY_FILTER_ID,
    label: CAMPAIGN_ACCESS_TABLE_FILTER_LABEL,
    options: [
      { label: CAMPAIGN_ACCESS_TABLE_FILTER_AVAILABLE, value: 'available' },
      { label: CAMPAIGN_ACCESS_TABLE_FILTER_UNAVAILABLE, value: 'unavailable' },
      { label: CAMPAIGN_ACCESS_TABLE_FILTER_ALL, value: 'all' },
    ],
    group: 'secondary',
    defaultValue: CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
    showAllOption: false,
    matches: (row, value) =>
      campaignAvailabilityFilterFn(
        readCampaignAccess(row).available,
        value as 'available' | 'unavailable' | 'all',
      ),
  }
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
      return <DataTableImageCell src={getContentImageUrl(key)} />
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

  const nameColumn: ColumnDef<T> = {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
    cell: ({ row }) => {
      const name = row.getValue<string>('name')
      const draftBadge =
        row.original.status === 'draft' ? <ContentStatusNameBadge status="draft" /> : null

      return (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="inline-flex items-center gap-2">
            {nameHref ? (
              <Link to={nameHref(row.original)} className={dataTableNameLinkCellVariants()}>
                {name}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{name}</span>
            )}
            {draftBadge}
          </span>
          <ContentNameCellMetadata campaignAccess={readCampaignAccess(row.original)} />
        </div>
      )
    },
    enableHiding: false,
    meta: {
      ...dataTableColumnMeta.identity,
      ...dataTableWidthMeta('title'),
      label: 'Name',
      locked: true,
    },
  }

  const sourceColumn = buildSourceColumn<T, ContentSource>({
    badgeMap: CONTENT_SOURCE_BADGE,
  })

  const statusColumn = buildSourceColumn<T, ContentStatus>({
    badgeMap: CONTENT_STATUS_BADGE,
    accessorKey: 'status',
    label: 'Status',
  })

  return [imageColumn, nameColumn, ...stampDataColumns(middleColumns), statusColumn, sourceColumn]
}

/**
 * Wraps content-specific filters with the shared name text filter (prepended,
 * primary) and source select filter (appended, secondary). Every content
 * overview uses this to stay consistent.
 *
 * @example
 * const filters = buildContentFilters([hitDieFilter, spellcastingFilter])
 */
export function buildContentFilters<T extends ContentBase>(
  contentFilters: FilterDef<T>[],
): FilterDef<T>[] {
  return [
    BASE_NAME_FILTER,
    ...contentFilters,
    BASE_SOURCE_FILTER,
    BASE_STATUS_FILTER,
    buildCampaignAvailabilityFilter<T>(),
  ]
}
