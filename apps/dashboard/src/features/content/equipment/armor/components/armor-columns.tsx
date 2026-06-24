import type { ArmorEquipment } from '@rpg/contracts'
import { ARMOR_CATEGORIES, getArmorAcDisplay, getArmorCategoryLabel } from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  buildContentColumns,
  buildContentFilters,
  costColumn,
} from '../../../lib/content-table-config'

function armorAcSortValue(item: ArmorEquipment): number {
  if (item.category === 'shields') return 999
  return item.baseAc ?? 0
}

const ARMOR_MIDDLE_COLUMNS: ColumnDef<ArmorEquipment>[] = [
  {
    accessorKey: 'category',
    header: ({ column }) => <SortableHeader column={column}>Category</SortableHeader>,
    cell: ({ row }) => getArmorCategoryLabel(row.getValue<string>('category')),
    filterFn: 'equalsString',
    meta: { label: 'Category' },
  },
  {
    id: 'ac',
    accessorFn: (row) => armorAcSortValue(row),
    header: ({ column }) => <SortableHeader column={column}>AC</SortableHeader>,
    cell: ({ row }) => getArmorAcDisplay(row.original),
    meta: { label: 'AC' },
  },
  {
    id: 'stealth',
    header: 'Stealth',
    cell: ({ row }) => (row.original.stealthDisadvantage ? 'Disadvantage' : '—'),
    meta: { label: 'Stealth' },
  },
  costColumn<ArmorEquipment>(),
]

const ARMOR_SPECIFIC_FILTERS: FilterDef[] = [
  {
    type: 'select',
    id: 'category',
    label: 'Category',
    options: ARMOR_CATEGORIES.map((category) => ({
      label: getArmorCategoryLabel(category),
      value: category,
    })),
  },
]

/** Armor column definitions with the name cell linked to the detail page. */
export function armorColumns(campaignId: string) {
  return buildContentColumns<ArmorEquipment>(ARMOR_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.equipment.detail(campaignId, 'armor', row.id),
  })
}

export const armorFilters = buildContentFilters(ARMOR_SPECIFIC_FILTERS)
