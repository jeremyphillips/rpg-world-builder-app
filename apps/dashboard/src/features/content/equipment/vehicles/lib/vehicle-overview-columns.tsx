import {
  VEHICLE_CATEGORIES,
  getVehicleCategoryLabel,
  type VehicleEquipment,
  type WithCampaignAccess,
} from '@rpg/contracts'
import type { ContentOverviewUsageScope, ContentUsageSummaryLabels } from '@rpg/contracts'
import { SortableHeader, type ColumnDef } from '@rpg/ui'
import { createEqualsFilter } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import { buildContentColumns, costColumn } from '../../../lib/overview/content-table-config'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../../lib/overview/content-overview-filter-schema'
import { equipmentSpeedColumn } from '../../lib/equipment-form-field-helpers'

type VehicleRow = WithCampaignAccess<VehicleEquipment>

export type VehicleOverviewFilterState = ContentOverviewBaseFilterState & {
  vehicleCategory?: string
}

const VEHICLE_MIDDLE_COLUMNS: ColumnDef<VehicleEquipment>[] = [
  {
    accessorKey: 'vehicleCategory',
    header: ({ column }) => <SortableHeader column={column}>Category</SortableHeader>,
    cell: ({ row }) => getVehicleCategoryLabel(row.getValue<string>('vehicleCategory')),
    filterFn: 'equalsString',
    meta: { label: 'Category' },
  },
  equipmentSpeedColumn<VehicleEquipment>(),
  costColumn<VehicleEquipment>(),
]

export const vehicleFilterSchema = buildContentFilterSchema<VehicleRow, VehicleOverviewFilterState>(
  'equipment',
  [
    createEqualsFilter<VehicleRow, VehicleOverviewFilterState, 'vehicleCategory', string>({
      id: 'vehicleCategory',
      label: 'Category',
      options: VEHICLE_CATEGORIES.map((category) => ({
        label: getVehicleCategoryLabel(category),
        value: category,
      })),
      getValue: (row) => row.vehicleCategory,
    }),
  ],
)

/** Vehicle column definitions with the name cell linked to the detail page. */
export function vehicleColumns(
  campaignId: string,
  usage?: {
    usageSummaryLabels?: ContentUsageSummaryLabels
    overviewUsageScope?: ContentOverviewUsageScope
  },
) {
  return buildContentColumns<VehicleEquipment>(VEHICLE_MIDDLE_COLUMNS, {
    ...usage,
    contentType: 'equipment',
    nameHref: (row) => ROUTES.content.equipment.detail(campaignId, 'vehicles', row.id),
  })
}
