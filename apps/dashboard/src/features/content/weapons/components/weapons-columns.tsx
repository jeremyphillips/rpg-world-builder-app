import type { Weapon } from '@rpg/contracts'
import {
  WEAPON_CATEGORIES,
  WEAPON_MASTERIES,
  averageWeaponDamage,
  formatWeaponDamage,
  getWeaponMasteryLabel,
} from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  buildContentColumns,
  buildContentFilters,
  costColumn,
} from '../../lib/content-table-config'

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const WEAPONS_MIDDLE_COLUMNS: ColumnDef<Weapon>[] = [
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
      const w = row.original
      if (!w.damage) return '—'
      return `${formatWeaponDamage(w.damage)} ${w.damageType ?? ''}`
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
  costColumn<Weapon>(),
]

const WEAPONS_SPECIFIC_FILTERS: FilterDef[] = [
  {
    type: 'select',
    id: 'category',
    label: 'Category',
    options: WEAPON_CATEGORIES.map((c) => ({ label: capitalize(c), value: c })),
  },
  {
    type: 'select',
    id: 'mastery',
    label: 'Mastery',
    options: WEAPON_MASTERIES.map((value) => ({ label: getWeaponMasteryLabel(value), value })),
  },
]

/** Weapon column definitions with the name cell linked to the detail page. */
export function weaponsColumns(campaignId: string) {
  return buildContentColumns<Weapon>(WEAPONS_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.equipment.detail(campaignId, row.id),
  })
}

export const weaponsFilters = buildContentFilters(WEAPONS_SPECIFIC_FILTERS)
