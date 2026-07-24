import type { ArmorEquipment, WithCampaignAccess } from '@rpg/contracts'
import { ARMOR_CATEGORIES, getArmorAcDisplay, getArmorCategoryLabel } from '@rpg/contracts'
import { dataTableTypographyMeta, SortableHeader } from '@rpg/ui'
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

function armorAcSortValue(item: ArmorEquipment): number {
  if (item.category === 'shields') return 999
  return item.baseAc ?? 0
}

type ArmorRow = WithCampaignAccess<ArmorEquipment>

export type ArmorOverviewFilterState = ContentOverviewBaseFilterState & {
  category?: string
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
    meta: { label: 'AC', ...dataTableTypographyMeta('meta') },
  },
  {
    id: 'stealth',
    header: 'Stealth',
    cell: ({ row }) => (row.original.stealthDisadvantage ? 'Disadvantage' : '—'),
    meta: { label: 'Stealth' },
  },
  costColumn<ArmorEquipment>(),
]

export const armorFilterSchema = buildContentFilterSchema<ArmorRow, ArmorOverviewFilterState>([
  createEqualsFilter<ArmorRow, ArmorOverviewFilterState, 'category', string>({
    id: 'category',
    label: 'Category',
    options: ARMOR_CATEGORIES.map((category) => ({
      label: getArmorCategoryLabel(category),
      value: category,
    })),
    getValue: (row) => row.category,
  }),
])

/** Armor column definitions with the name cell linked to the detail page. */
export function armorColumns(campaignId: string) {
  return buildContentColumns<ArmorEquipment>(ARMOR_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.equipment.detail(campaignId, 'armor', row.id),
  })
}
