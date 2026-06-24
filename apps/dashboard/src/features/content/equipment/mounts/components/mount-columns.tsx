import { formatMass, type MountEquipment } from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  buildContentColumns,
  buildContentFilters,
  costColumn,
} from '../../../lib/content-table-config'

const MOUNT_MIDDLE_COLUMNS: ColumnDef<MountEquipment>[] = [
  {
    id: 'carryingCapacity',
    accessorFn: (row) => row.carryingCapacity.value,
    header: ({ column }) => <SortableHeader column={column}>Carrying capacity</SortableHeader>,
    cell: ({ row }) => formatMass(row.original.carryingCapacity),
    meta: { label: 'Carrying capacity' },
  },
  {
    accessorKey: 'speed',
    header: ({ column }) => <SortableHeader column={column}>Speed</SortableHeader>,
    cell: ({ row }) => row.getValue<string>('speed') ?? '—',
    meta: { label: 'Speed' },
  },
  costColumn<MountEquipment>(),
]

/** Mount column definitions with the name cell linked to the detail page. */
export function mountColumns(campaignId: string) {
  return buildContentColumns<MountEquipment>(MOUNT_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.equipment.detail(campaignId, 'mounts', row.id),
  })
}

export const mountFilters = buildContentFilters([])
