import type { ServiceEquipment, WithCampaignAccess } from '@rpg/contracts'
import { SERVICE_CATEGORIES, formatServiceDuration, getServiceCategoryLabel } from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import { createEqualsFilter } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import {
  buildContentColumns,
  costColumn,
} from '../../../lib/overview/content-table-config'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../../lib/overview/content-overview-filter-schema'

type ServiceRow = WithCampaignAccess<ServiceEquipment>

export type ServiceOverviewFilterState = ContentOverviewBaseFilterState & {
  serviceCategory?: string
}

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

export const serviceFilterSchema = buildContentFilterSchema<
  ServiceRow,
  ServiceOverviewFilterState
>([
  createEqualsFilter<ServiceRow, ServiceOverviewFilterState, 'serviceCategory', string>({
    id: 'serviceCategory',
    label: 'Category',
    options: SERVICE_CATEGORIES.map((category) => ({
      label: getServiceCategoryLabel(category),
      value: category,
    })),
    getValue: (row) => row.serviceCategory,
  }),
])

/** Service column definitions with the name cell linked to the detail page. */
export function serviceColumns(campaignId: string) {
  return buildContentColumns<ServiceEquipment>(SERVICE_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.equipment.detail(campaignId, 'services', row.id),
  })
}
