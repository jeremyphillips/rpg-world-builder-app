import { VEHICLE_CATEGORIES, getVehicleCategoryLabel, type VehicleEquipment } from '@rpg/contracts'
import { SortableHeader, type ColumnDef, type FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  buildContentColumns,
  buildContentFilters,
  costColumn,
} from '../../../lib/content-table-config'
import { equipmentSpeedColumn } from '../../lib/equipment-form-field-helpers'

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

const VEHICLE_SPECIFIC_FILTERS: FilterDef[] = [
  {
    type: 'select',
    id: 'vehicleCategory',
    label: 'Category',
    options: VEHICLE_CATEGORIES.map((category) => ({
      label: getVehicleCategoryLabel(category),
      value: category,
    })),
  },
]

/** Vehicle column definitions with the name cell linked to the detail page. */
export function vehicleColumns(campaignId: string) {
  return buildContentColumns<VehicleEquipment>(VEHICLE_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.equipment.detail(campaignId, 'vehicles', row.id),
  })
}

export const vehicleFilters = buildContentFilters(VEHICLE_SPECIFIC_FILTERS)
