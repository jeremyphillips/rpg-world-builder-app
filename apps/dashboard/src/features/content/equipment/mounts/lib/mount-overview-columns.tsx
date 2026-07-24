import { formatMass, type MountEquipment, type WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'
import { SortableHeader } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  buildContentColumns,
  costColumn,
} from '../../../lib/overview/content-table-config'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../../lib/overview/content-overview-filter-schema'
import { equipmentSpeedColumn } from '../../lib/equipment-form-field-helpers'

type MountRow = WithCampaignAccess<MountEquipment>

export type MountOverviewFilterState = ContentOverviewBaseFilterState

const MOUNT_MIDDLE_COLUMNS: ColumnDef<MountEquipment>[] = [
  {
    id: 'carryingCapacity',
    accessorFn: (row) => row.carryingCapacity.value,
    header: ({ column }) => <SortableHeader column={column}>Carrying capacity</SortableHeader>,
    cell: ({ row }) => formatMass(row.original.carryingCapacity),
    meta: { label: 'Carrying capacity' },
  },
  equipmentSpeedColumn<MountEquipment>(),
  costColumn<MountEquipment>(),
]

export const mountFilterSchema = buildContentFilterSchema<MountRow, MountOverviewFilterState>([])

/** Mount column definitions with the name cell linked to the detail page. */
export function mountColumns(campaignId: string) {
  return buildContentColumns<MountEquipment>(MOUNT_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.equipment.detail(campaignId, 'mounts', row.id),
  })
}
