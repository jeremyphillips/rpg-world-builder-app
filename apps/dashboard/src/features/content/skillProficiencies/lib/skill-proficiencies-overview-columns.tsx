import type { SkillProficiency } from '@rpg/contracts'
import { ABILITY_ENTRIES, ABILITY_IDS } from '@rpg/contracts'
import { dataTableTypographyMeta, dataTableWidthMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { buildContentColumns, buildContentFilters } from '../../lib/overview/content-table-config'

const SKILL_MIDDLE_COLUMNS: ColumnDef<SkillProficiency>[] = [
  {
    accessorKey: 'ability',
    header: ({ column }) => <SortableHeader column={column}>Ability</SortableHeader>,
    cell: ({ row }) => row.getValue<SkillProficiency['ability']>('ability').toUpperCase(),
    filterFn: 'equalsString',
    meta: { label: 'Ability', ...dataTableWidthMeta('tiny'), ...dataTableTypographyMeta('stat') },
  },
]

const SKILL_SPECIFIC_FILTERS: FilterDef[] = [
  {
    type: 'select',
    id: 'ability',
    label: 'Ability',
    options: ABILITY_IDS.map((id) => ({ value: id, label: ABILITY_ENTRIES[id].label })),
  },
]

/** Skill proficiency column definitions with the name cell linked to the detail page. */
export function skillProficienciesColumns(campaignId: string) {
  return buildContentColumns<SkillProficiency>(SKILL_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.skillProficiencies.detail(campaignId, row.id),
  })
}

export const skillProficienciesFilters = buildContentFilters(SKILL_SPECIFIC_FILTERS)
