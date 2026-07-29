import type { WeaponEquipment, WithCampaignAccess } from '@rpg/contracts'
import {
  WEAPON_CATEGORIES,
  WEAPON_MASTERIES,
  averageWeaponDamage,
  formatWeaponDamage,
  getWeaponMasteryLabel,
} from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import { createEqualsFilter } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import { buildContentColumns, costColumn } from '../../../lib/overview/content-table-config'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../../lib/overview/content-overview-filter-schema'

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

type WeaponRow = WithCampaignAccess<WeaponEquipment>

export type WeaponOverviewFilterState = ContentOverviewBaseFilterState & {
  category?: string
  mastery?: string
}

const WEAPON_MIDDLE_COLUMNS: ColumnDef<WeaponEquipment>[] = [
  {
    accessorKey: 'category',
    header: ({ column }) => <SortableHeader column={column}>Category</SortableHeader>,
    cell: ({ row }) => capitalize(row.getValue<string>('category')),
    filterFn: 'equalsString',
    meta: { label: 'Category' },
  },
  {
    id: 'damage',
    accessorFn: (row) => (row.damage ? averageWeaponDamage(row.damage) : 0),
    header: ({ column }) => <SortableHeader column={column}>Damage</SortableHeader>,
    cell: ({ row }) => {
      const weapon = row.original
      if (!weapon.damage) return '—'
      return `${formatWeaponDamage(weapon.damage)} ${weapon.damageType ?? ''}`
    },
    meta: { label: 'Damage' },
  },
  {
    accessorKey: 'mastery',
    header: ({ column }) => <SortableHeader column={column}>Mastery</SortableHeader>,
    cell: ({ row }) => getWeaponMasteryLabel(row.getValue<string>('mastery')),
    filterFn: 'equalsString',
    meta: { label: 'Mastery' },
  },
  costColumn<WeaponEquipment>(),
]

export const weaponFilterSchema = buildContentFilterSchema<WeaponRow, WeaponOverviewFilterState>(
  'equipment',
  [
    createEqualsFilter<WeaponRow, WeaponOverviewFilterState, 'category', string>({
      id: 'category',
      label: 'Category',
      options: WEAPON_CATEGORIES.map((category) => ({
        label: capitalize(category),
        value: category,
      })),
      getValue: (row) => row.category,
    }),
    createEqualsFilter<WeaponRow, WeaponOverviewFilterState, 'mastery', string>({
      id: 'mastery',
      label: 'Mastery',
      options: WEAPON_MASTERIES.map((mastery) => ({
        label: getWeaponMasteryLabel(mastery),
        value: mastery,
      })),
      getValue: (row) => row.mastery,
    }),
  ],
)

/** Weapon column definitions with the name cell linked to the detail page. */
export function weaponColumns(campaignId: string) {
  return buildContentColumns<WeaponEquipment>(WEAPON_MIDDLE_COLUMNS, {
    contentType: 'equipment',
    nameHref: (row) => ROUTES.content.equipment.detail(campaignId, 'weapons', row.id),
  })
}
