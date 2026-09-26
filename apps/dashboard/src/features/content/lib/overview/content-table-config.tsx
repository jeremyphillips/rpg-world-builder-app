import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  formatEquipmentCostLabel,
  moneyToCp,
  type ContentOverviewUsageScope,
  type ContentStatus,
  type ContentUsageSummaryLabels,
  type EquipmentCost,
  type ResolvedContentCampaignAccess,
  type WithCampaignAccess,
  type ContentTypeKey,
} from '@rpg/contracts'
import { dataTableColumnMeta, dataTableWidthMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'

import { buildSourceColumn, stampDataColumns } from '@/lib/data-table/column-builders'
import { ContentDisplayOverviewCell } from '@/features/media/components/content-display-overview-cell'

import {
  resolveDashboardContentDisplay,
  type DashboardContentDisplayResult,
  type ResolveDashboardContentDisplayInput,
} from '../detail/page/content-display-image'
import { CONTENT_SOURCE_BADGE, type ContentSource } from './content-source-badge'
import { CONTENT_STATUS_BADGE } from './content-status-badge'
import { ContentOverviewNameCell } from './content-overview-name-cell'
import { shouldPresentContentSource } from '../content-type-presentation'
import { buildContentUsedByColumn } from './content-used-by-column'

/**
 * Minimum shape every content type shares. Used to constrain the generic
 * so the shared image, name, and source columns are type-safe.
 */
export type ContentBase = {
  name: string
  slug?: string
  rulesetId?: string
  source: ContentSource
  status: ContentStatus
  media?: import('@rpg/contracts').ContentMedia
}

function readCampaignAccess(row: ContentBase): ResolvedContentCampaignAccess {
  return (row as WithCampaignAccess<ContentBase>).campaignAccess ?? DEFAULT_CONTENT_CAMPAIGN_ACCESS
}

export { readCampaignAccess as readContentRowCampaignAccess }

export type ContentTableOptions<T> = {
  /** Content type used to resolve shared source-presentation policy. */
  contentType: ContentTypeKey
  /** When false, omits the leading image column (spells, feats, skill-proficiencies). */
  includeImageColumn?: boolean
  /** Optional resolver for crop-aware overview thumbnails and fallback icons. */
  resolveOverviewDisplay?: (row: T) => DashboardContentDisplayResult
  /** When provided, the name cell renders as a link to this href. */
  nameHref?: (row: T) => string
  /** When provided with `canManage`, renders the line-2 Edit utility action. */
  editHref?: (row: T) => string
  /** Whether the viewer can manage campaign content (overview utility row). */
  canManage?: boolean
  /** When set with overviewUsageScope from list API, appends Used By column. */
  usageSummaryLabels?: ContentUsageSummaryLabels
  overviewUsageScope?: ContentOverviewUsageScope
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

function buildDefaultOverviewDisplayResolver<T extends ContentBase>(
  contentType: ContentTypeKey,
): (row: T) => DashboardContentDisplayResult {
  return (row) =>
    resolveDashboardContentDisplay({
      media: row.media,
      contentType,
      slug: row.slug ?? row.name,
      contentSource: row.source,
      rulesetId: row.rulesetId,
      surface: 'compact',
    } satisfies ResolveDashboardContentDisplayInput)
}

/**
 * Wraps content-specific columns with the shared image + name (prepended) and
 * source (appended) columns. Every content overview uses this to stay consistent.
 */
export function buildContentColumns<T extends ContentBase>(
  middleColumns: ColumnDef<T>[],
  options: ContentTableOptions<T>,
): ColumnDef<T>[] {
  const {
    contentType,
    includeImageColumn = !['spells', 'feats', 'skill-proficiencies'].includes(contentType),
    resolveOverviewDisplay,
    nameHref,
    editHref,
    canManage = false,
    usageSummaryLabels,
    overviewUsageScope,
  } = options

  const resolveDisplay =
    resolveOverviewDisplay ?? buildDefaultOverviewDisplayResolver<T>(contentType)

  const imageColumn: ColumnDef<T> = {
    id: 'overview-display-image',
    header: () => <span className="sr-only">Image</span>,
    cell: ({ row }) => (
      <ContentDisplayOverviewCell resolved={resolveDisplay(row.original)} alt={row.original.name} />
    ),
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

  const usedByColumn =
    usageSummaryLabels != null
      ? [
          buildContentUsedByColumn<T & { id: string; usedBy: number }>(
            usageSummaryLabels,
            overviewUsageScope,
          ) as ColumnDef<T>,
        ]
      : []

  const leadingColumns = includeImageColumn ? [imageColumn] : []

  return [
    ...leadingColumns,
    nameColumn,
    ...stampDataColumns(middleColumns),
    ...usedByColumn,
    statusColumn,
    ...(shouldPresentContentSource(contentType) ? [sourceColumn] : []),
  ]
}
