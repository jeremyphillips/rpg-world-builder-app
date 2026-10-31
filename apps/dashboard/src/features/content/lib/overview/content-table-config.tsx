import {
  formatEquipmentCostLabel,
  moneyToCp,
  type ContentOverviewUsageScope,
  type ContentStatus,
  type ContentUsageSummaryLabels,
  type EquipmentCost,
  type WithCampaignAccess,
  type ContentMedia,
  isContentTypeMediaEnabled,
  type ContentTypeKey,
  CATALOG_LAYER_TERM,
} from '@rpg/contracts'
import { dataTableColumnMeta, dataTableWidthMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'

import { buildSourceColumn, stampDataColumns } from '@/lib/data-table/column-builders'
import { ContentDisplayOverviewCell } from '@/features/media'

import {
  resolveDashboardContentDisplay,
  type DashboardContentDisplayResult,
  type ResolveDashboardContentDisplayInput,
} from '../detail/page/content-display-image'
import { CATALOG_LAYER_BADGE, type CatalogLayer } from './catalog-layer-badge'
import { CONTENT_STATUS_BADGE } from './content-status-badge'
import { ContentOverviewNameCell } from './content-overview-name-cell'
import { shouldPresentCatalogLayer } from '../content-type-presentation'
import { buildContentUsedByColumn } from './content-used-by-column'
import { resolveReadSurfaceCampaignAccess } from '../campaign-access/resolve-read-surface-campaign-access'

/**
 * Minimum shape every content type shares. Used to constrain the generic
 * so the shared image, name, and source columns are type-safe.
 */
export type ContentBase = {
  name: string
  slug?: string
  rulesetId?: string
  catalogLayer: CatalogLayer
  status: ContentStatus
  media?: ContentMedia
}

export type ContentTableOptions<T> = {
  /** Content type used to resolve shared source-presentation policy. */
  contentType: ContentTypeKey
  /** When false, omits the leading image column (non-media catalog types). */
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
      catalogLayer: row.catalogLayer,
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
    includeImageColumn = isContentTypeMediaEnabled(contentType),
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
        campaignAccess={resolveReadSurfaceCampaignAccess(
          contentType,
          (row.original as unknown as WithCampaignAccess<ContentBase>).campaignAccess,
        )}
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

  const catalogLayerColumn = buildSourceColumn<T, CatalogLayer>({
    badgeMap: CATALOG_LAYER_BADGE,
    accessorKey: 'catalogLayer',
    label: CATALOG_LAYER_TERM.label,
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
    ...(shouldPresentCatalogLayer(contentType) ? [catalogLayerColumn] : []),
  ]
}
