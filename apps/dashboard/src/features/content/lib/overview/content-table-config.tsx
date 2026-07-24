import {
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
  dataTableWidthMeta,
  SortableHeader,
} from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'

import { buildSourceColumn, stampDataColumns } from '@/lib/data-table/column-builders'

import { getContentImageUrl } from '../detail/content-image-url'
import { CONTENT_SOURCE_BADGE, type ContentSource } from './content-source-badge'
import { CONTENT_STATUS_BADGE } from './content-status-badge'
import { ContentOverviewNameCell } from './content-overview-name-cell.client'

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

function readCampaignAccess(row: ContentBase): ResolvedContentCampaignAccess {
  return (row as WithCampaignAccess<ContentBase>).campaignAccess ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS
}

export { readCampaignAccess as readContentRowCampaignAccess }

export type ContentTableOptions<T> = {
  /** When provided, the name cell renders as a link to this href. */
  nameHref?: (row: T) => string
  /** When provided with `canManage`, renders the line-2 Edit utility action. */
  editHref?: (row: T) => string
  /** Whether the viewer can manage campaign content (overview utility row). */
  canManage?: boolean
}

export type ContentOverviewNameColumnMeta<T> = {
  overviewNameHref?: (row: T) => string
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
  const { nameHref, editHref, canManage = false } = options ?? {}

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
    cell: ({ row }) => (
      <ContentOverviewNameCell
        name={row.getValue<string>('name')}
        status={row.original.status}
        campaignAccess={readCampaignAccess(row.original)}
        nameHref={nameHref?.(row.original)}
        editHref={canManage ? editHref?.(row.original) : undefined}
        canManage={canManage}
      />
    ),
    enableHiding: false,
    meta: {
      ...dataTableColumnMeta.identity,
      ...dataTableWidthMeta('title'),
      label: 'Name',
      locked: true,
      overviewNameHref: nameHref,
    } as ColumnDef<T>['meta'] & ContentOverviewNameColumnMeta<T>,
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
