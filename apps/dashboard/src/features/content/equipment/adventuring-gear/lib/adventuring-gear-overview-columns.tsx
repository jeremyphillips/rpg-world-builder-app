import type { AdventuringGearEquipment } from '@rpg/contracts'
import {
  GEAR_KINDS,
  formatWeight,
  getGearKindLabel,
  getSpellcastingGearKindLabel,
} from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  buildContentColumns,
  buildContentFilters,
  costColumn,
} from '../../../lib/overview/content-table-config'

function formatAdventuringGearKindLabel(item: AdventuringGearEquipment): string {
  if (item.gearKind === 'spellcasting' && item.spellcastingGearKind) {
    return getSpellcastingGearKindLabel(item.spellcastingGearKind)
  }
  return getGearKindLabel(item.gearKind)
}

const ADVENTURING_GEAR_MIDDLE_COLUMNS: ColumnDef<AdventuringGearEquipment>[] = [
  {
    accessorKey: 'gearKind',
    header: ({ column }) => <SortableHeader column={column}>Gear kind</SortableHeader>,
    cell: ({ row }) => formatAdventuringGearKindLabel(row.original),
    filterFn: 'equalsString',
    meta: { label: 'Gear kind' },
  },
  {
    id: 'weight',
    accessorFn: (row) => row.weight?.value,
    header: ({ column }) => <SortableHeader column={column}>Weight</SortableHeader>,
    cell: ({ row }) => (row.original.weight ? formatWeight(row.original.weight) : '—'),
    meta: { label: 'Weight' },
  },
  costColumn<AdventuringGearEquipment>(),
]

const ADVENTURING_GEAR_SPECIFIC_FILTERS: FilterDef[] = [
  {
    type: 'select',
    id: 'gearKind',
    label: 'Gear kind',
    options: GEAR_KINDS.map((gearKind) => ({
      label: getGearKindLabel(gearKind),
      value: gearKind,
    })),
  },
]

/** Adventuring gear column definitions with the name cell linked to the detail page. */
export function adventuringGearColumns(campaignId: string) {
  return buildContentColumns<AdventuringGearEquipment>(ADVENTURING_GEAR_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.equipment.detail(campaignId, 'adventuring-gear', row.id),
  })
}

export const adventuringGearFilters = buildContentFilters(ADVENTURING_GEAR_SPECIFIC_FILTERS)
