import type { MagicItemEquipment, WithCampaignAccess } from '@rpg/contracts'
import {
  MAGIC_ITEM_CATEGORIES,
  MAGIC_ITEM_RARITIES,
  getMagicItemCategoryLabel,
  getMagicItemRarityLabel,
} from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
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

function formatAttunement(requiresAttunement: boolean | undefined): string {
  if (requiresAttunement === undefined) return '—'
  return requiresAttunement ? 'Required' : 'None'
}

type MagicItemRow = WithCampaignAccess<MagicItemEquipment>

export type MagicItemOverviewFilterState = ContentOverviewBaseFilterState & {
  rarity?: string
  magicItemCategory?: string
}

const MAGIC_ITEM_MIDDLE_COLUMNS: ColumnDef<MagicItemEquipment>[] = [
  {
    accessorKey: 'rarity',
    header: ({ column }) => <SortableHeader column={column}>Rarity</SortableHeader>,
    cell: ({ row }) => {
      const rarity = row.getValue<string | undefined>('rarity')
      return rarity ? getMagicItemRarityLabel(rarity) : '—'
    },
    filterFn: 'equalsString',
    meta: { label: 'Rarity' },
  },
  {
    accessorKey: 'magicItemCategory',
    header: ({ column }) => <SortableHeader column={column}>Category</SortableHeader>,
    cell: ({ row }) => {
      const category = row.getValue<string | undefined>('magicItemCategory')
      return category ? getMagicItemCategoryLabel(category) : '—'
    },
    filterFn: 'equalsString',
    meta: { label: 'Category' },
  },
  {
    accessorKey: 'requiresAttunement',
    header: ({ column }) => <SortableHeader column={column}>Attunement</SortableHeader>,
    cell: ({ row }) => formatAttunement(row.getValue<boolean | undefined>('requiresAttunement')),
    meta: { label: 'Attunement' },
  },
  costColumn<MagicItemEquipment>(),
]

export const magicItemFilterSchema = buildContentFilterSchema<
  MagicItemRow,
  MagicItemOverviewFilterState
>([
  createEqualsFilter<MagicItemRow, MagicItemOverviewFilterState, 'rarity', string>({
    id: 'rarity',
    label: 'Rarity',
    options: MAGIC_ITEM_RARITIES.map((rarity) => ({
      label: getMagicItemRarityLabel(rarity),
      value: rarity,
    })),
    getValue: (row) => row.rarity ?? '',
  }),
  createEqualsFilter<MagicItemRow, MagicItemOverviewFilterState, 'magicItemCategory', string>({
    id: 'magicItemCategory',
    label: 'Category',
    options: MAGIC_ITEM_CATEGORIES.map((category) => ({
      label: getMagicItemCategoryLabel(category),
      value: category,
    })),
    getValue: (row) => row.magicItemCategory ?? '',
  }),
])

/** Magic item column definitions with the name cell linked to the detail page. */
export function magicItemColumns(campaignId: string) {
  return buildContentColumns<MagicItemEquipment>(MAGIC_ITEM_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.equipment.detail(campaignId, 'magic-items', row.id),
  })
}
