import type { ToolEquipment } from '@rpg/contracts'
import { TOOL_CATEGORIES, getToolCategoryLabel } from '@rpg/contracts'
import { dataTableTypographyMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  buildContentColumns,
  buildContentFilters,
  costColumn,
} from '../../../lib/overview/content-table-config'

const TOOL_MIDDLE_COLUMNS: ColumnDef<ToolEquipment>[] = [
  {
    accessorKey: 'toolCategory',
    header: ({ column }) => <SortableHeader column={column}>Category</SortableHeader>,
    cell: ({ row }) => getToolCategoryLabel(row.getValue<string>('toolCategory')),
    filterFn: 'equalsString',
    meta: { label: 'Category' },
  },
  {
    accessorKey: 'ability',
    header: ({ column }) => <SortableHeader column={column}>Ability</SortableHeader>,
    cell: ({ row }) => {
      const ability = row.getValue<ToolEquipment['ability']>('ability')
      return ability.toUpperCase()
    },
    meta: { label: 'Ability', ...dataTableTypographyMeta('stat') },
  },
  costColumn<ToolEquipment>(),
]

const TOOL_SPECIFIC_FILTERS: FilterDef[] = [
  {
    type: 'select',
    id: 'toolCategory',
    label: 'Category',
    options: TOOL_CATEGORIES.map((category) => ({
      label: getToolCategoryLabel(category),
      value: category,
    })),
  },
]

/** Tool column definitions with the name cell linked to the detail page. */
export function toolColumns(campaignId: string) {
  return buildContentColumns<ToolEquipment>(TOOL_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.equipment.detail(campaignId, 'tools', row.id),
  })
}

export const toolFilters = buildContentFilters(TOOL_SPECIFIC_FILTERS)
