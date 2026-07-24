import type { Equipment, WithCampaignAccess } from '@rpg/contracts'
import { EQUIPMENT_KIND_LABELS, getEquipmentKindLabel } from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import { createEqualsFilter } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import {
  buildContentColumns,
  costColumn,
} from '../../lib/overview/content-table-config'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../lib/overview/content-overview-filter-schema'
import { equipmentKindToFamilyPath } from '../lib/shared/equipment-family-paths'

type EquipmentRow = WithCampaignAccess<Equipment>

export type EquipmentOverviewFilterState = ContentOverviewBaseFilterState & {
  kind?: string
}

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

export const equipmentFilterSchema = buildContentFilterSchema<
  EquipmentRow,
  EquipmentOverviewFilterState
>([
  createEqualsFilter<EquipmentRow, EquipmentOverviewFilterState, 'kind', string>({
    id: 'kind',
    label: 'Kind',
    options: Object.entries(EQUIPMENT_KIND_LABELS).map(([value, label]) => ({ label, value })),
    getValue: (row) => row.kind,
  }),
])

/** Equipment column definitions with the name cell linked to the detail page. */
export function equipmentColumns(campaignId: string) {
  return buildContentColumns<Equipment>(EQUIPMENT_MIDDLE_COLUMNS, {
    nameHref: (row) =>
      ROUTES.content.equipment.detail(campaignId, equipmentKindToFamilyPath(row.kind), row.id),
  })
}
