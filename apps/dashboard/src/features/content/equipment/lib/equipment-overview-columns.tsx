import type { Equipment } from '@rpg/contracts'
import { EQUIPMENT_KIND_LABELS, getEquipmentKindLabel } from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  buildContentColumns,
  buildContentFilters,
  costColumn,
} from '../../lib/overview/content-table-config'
import { equipmentKindToFamilyPath } from '../lib/shared/equipment-family-paths'

const EQUIPMENT_MIDDLE_COLUMNS: ColumnDef<Equipment>[] = [
  {
    accessorKey: 'kind',
    header: ({ column }) => <SortableHeader column={column}>Kind</SortableHeader>,
    cell: ({ row }) => getEquipmentKindLabel(row.getValue<string>('kind')),
    filterFn: 'equalsString',
    meta: { label: 'Kind' },
  },
  costColumn<Equipment>(),
]

const EQUIPMENT_SPECIFIC_FILTERS: FilterDef[] = [
  {
    type: 'select',
    id: 'kind',
    label: 'Kind',
    options: Object.entries(EQUIPMENT_KIND_LABELS).map(([value, label]) => ({ label, value })),
  },
]

/** Equipment column definitions with the name cell linked to the detail page. */
export function equipmentColumns(campaignId: string) {
  return buildContentColumns<Equipment>(EQUIPMENT_MIDDLE_COLUMNS, {
    nameHref: (row) =>
      ROUTES.content.equipment.detail(campaignId, equipmentKindToFamilyPath(row.kind), row.id),
  })
}

export const equipmentFilters = buildContentFilters(EQUIPMENT_SPECIFIC_FILTERS)
