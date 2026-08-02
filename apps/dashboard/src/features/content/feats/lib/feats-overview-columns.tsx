import type { Feat, WithCampaignAccess } from '@rpg/contracts'
import type { ContentOverviewUsageScope, ContentUsageSummaryLabels } from '@rpg/contracts'
import { FEAT_CATEGORY_IDS, getFeatCategoryLabel } from '@rpg/contracts'
import { BooleanCell, dataTableTypographyMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import { createEqualsFilter } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import { buildContentColumns } from '../../lib/overview/content-table-config'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../lib/overview/content-overview-filter-schema'
import { formatFeatCategoryTableLabel, formatFeatPrerequisiteSummary } from '../lib/feat-display'

type FeatRow = WithCampaignAccess<Feat>

export type FeatsOverviewFilterState = ContentOverviewBaseFilterState & {
  category?: Feat['category']
}

const FEATS_MIDDLE_COLUMNS: ColumnDef<Feat>[] = [
  {
    accessorKey: 'category',
    header: ({ column }) => <SortableHeader column={column}>Category</SortableHeader>,
    cell: ({ row }) => formatFeatCategoryTableLabel(row.getValue<Feat['category']>('category')),
    filterFn: 'equalsString',
    meta: { label: 'Category' },
  },
  {
    id: 'prerequisite',
    accessorFn: (row) => formatFeatPrerequisiteSummary(row),
    header: ({ column }) => <SortableHeader column={column}>Prerequisite</SortableHeader>,
    cell: ({ row }) => row.getValue<string>('prerequisite'),
    meta: { label: 'Prerequisite', ...dataTableTypographyMeta('metaItalic') },
  },
  {
    id: 'repeatable',
    accessorFn: (row) => row.repeatable.allowed,
    header: 'Repeatable',
    cell: ({ row }) => <BooleanCell value={row.getValue<boolean>('repeatable')} />,
    filterFn: 'boolean',
    enableSorting: false,
    meta: { label: 'Repeatable' },
  },
]

export const featsFilterSchema = buildContentFilterSchema<FeatRow, FeatsOverviewFilterState>(
  'feats',
  [
    createEqualsFilter<FeatRow, FeatsOverviewFilterState, 'category', Feat['category']>({
      id: 'category',
      label: 'Category',
      options: FEAT_CATEGORY_IDS.map((id) => ({
        label: getFeatCategoryLabel(id),
        value: id,
      })),
      getValue: (row) => row.category,
    }),
  ],
)

/** Feat column definitions with the name cell linked to the detail page. */
export function featsColumns(
  campaignId: string,
  usage?: {
    usageSummaryLabels?: ContentUsageSummaryLabels
    overviewUsageScope?: ContentOverviewUsageScope
  },
) {
  return buildContentColumns<Feat>(FEATS_MIDDLE_COLUMNS, {
    ...usage,
    contentType: 'feats',
    nameHref: (row) => ROUTES.content.feats.detail(campaignId, row.id),
  })
}
