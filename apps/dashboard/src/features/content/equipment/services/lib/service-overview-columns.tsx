import type { ServiceEquipment } from '@rpg/contracts'
import { SERVICE_CATEGORIES, formatServiceDuration, getServiceCategoryLabel } from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  buildContentColumns,
  buildContentFilters,
  costColumn,
} from '../../../lib/overview/content-table-config'

const SERVICE_MIDDLE_COLUMNS: ColumnDef<ServiceEquipment>[] = [
  {
    accessorKey: 'serviceCategory',
    header: ({ column }) => <SortableHeader column={column}>Category</SortableHeader>,
    cell: ({ row }) => getServiceCategoryLabel(row.getValue<string>('serviceCategory')),
    filterFn: 'equalsString',
    meta: { label: 'Category' },
  },
  {
    accessorKey: 'duration',
    header: ({ column }) => <SortableHeader column={column}>Duration</SortableHeader>,
    cell: ({ row }) => {
      const duration = row.getValue<ServiceEquipment['duration']>('duration')
      return duration ? formatServiceDuration(duration) : '—'
    },
    meta: { label: 'Duration' },
  },
  costColumn<ServiceEquipment>(),
]

const SERVICE_SPECIFIC_FILTERS: FilterDef[] = [
  {
    type: 'select',
    id: 'serviceCategory',
    label: 'Category',
    options: SERVICE_CATEGORIES.map((category) => ({
      label: getServiceCategoryLabel(category),
      value: category,
    })),
  },
]

/** Service column definitions with the name cell linked to the detail page. */
export function serviceColumns(campaignId: string) {
  return buildContentColumns<ServiceEquipment>(SERVICE_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.equipment.detail(campaignId, 'services', row.id),
  })
}

export const serviceFilters = buildContentFilters(SERVICE_SPECIFIC_FILTERS)
