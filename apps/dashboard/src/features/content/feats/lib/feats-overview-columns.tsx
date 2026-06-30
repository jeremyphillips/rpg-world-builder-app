import type { Feat } from '@rpg/contracts'
import { FEAT_CATEGORY_IDS, getFeatCategoryLabel } from '@rpg/contracts'
import { BooleanCell, dataTableTypographyMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { buildContentColumns, buildContentFilters } from '../../lib/overview/content-table-config'
import { formatFeatCategoryTableLabel, formatFeatPrerequisiteSummary } from '../lib/feat-stat-rows'

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

const FEATS_SPECIFIC_FILTERS: FilterDef[] = [
  {
    type: 'select',
    id: 'category',
    label: 'Category',
    options: FEAT_CATEGORY_IDS.map((id) => ({
      label: getFeatCategoryLabel(id),
      value: id,
    })),
  },
]

/** Feat column definitions with the name cell linked to the detail page. */
export function featsColumns(campaignId: string) {
  return buildContentColumns<Feat>(FEATS_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.feats.detail(campaignId, row.id),
  })
}

export const featsFilters = buildContentFilters(FEATS_SPECIFIC_FILTERS)
