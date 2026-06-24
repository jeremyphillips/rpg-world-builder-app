import type { Armor } from '@rpg/contracts'
import { ARMOR_CATEGORIES, getArmorCategoryLabel, getArmorAcDisplay } from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  buildContentColumns,
  buildContentFilters,
  costColumn,
} from '../../lib/content-table-config'

function armorAcSortValue(a: Armor): number {
  if (a.category === 'shields') return 999
  return a.baseAc ?? 0
}

const ARMOR_MIDDLE_COLUMNS: ColumnDef<Armor>[] = [
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
  costColumn<Armor>(),
]

const ARMOR_SPECIFIC_FILTERS: FilterDef[] = [
  {
    type: 'select',
    id: 'category',
    label: 'Category',
    options: ARMOR_CATEGORIES.map((c) => ({ label: getArmorCategoryLabel(c), value: c })),
  },
]

/** Armor column definitions with the name cell linked to the detail page. */
export function armorColumns(campaignId: string) {
  return buildContentColumns<Armor>(ARMOR_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.equipment.detail(campaignId, 'armor', row.id),
  })
}

export const armorFilters = buildContentFilters(ARMOR_SPECIFIC_FILTERS)
