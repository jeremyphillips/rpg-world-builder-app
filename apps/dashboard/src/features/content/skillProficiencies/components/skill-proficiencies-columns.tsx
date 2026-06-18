import type { SkillProficiency } from '@rpg/contracts'
import { ABILITIES } from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { buildContentColumns, buildContentFilters } from '../../lib/content-table-config'

const SKILL_MIDDLE_COLUMNS: ColumnDef<SkillProficiency>[] = [
  {
    accessorKey: 'ability',
    header: ({ column }) => <SortableHeader column={column}>Ability</SortableHeader>,
    cell: ({ row }) => ABILITIES[row.getValue<SkillProficiency['ability']>('ability')],
    filterFn: 'equalsString',
  },
]

const SKILL_SPECIFIC_FILTERS: FilterDef[] = [
  {
    type: 'select',
    id: 'ability',
    label: 'Ability',
    options: Object.entries(ABILITIES).map(([value, label]) => ({ label, value })),
  },
]

/** Skill proficiency column definitions with the name cell linked to the detail page. */
export function skillProficienciesColumns(campaignId: string) {
  return buildContentColumns<SkillProficiency>(SKILL_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.skillProficiencies.detail(campaignId, row.id),
  })
}

export const skillProficienciesFilters = buildContentFilters(SKILL_SPECIFIC_FILTERS)
