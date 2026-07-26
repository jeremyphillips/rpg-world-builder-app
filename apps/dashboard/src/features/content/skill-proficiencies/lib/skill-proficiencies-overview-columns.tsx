import type { SkillProficiency, WithCampaignAccess } from '@rpg/contracts'
import { ABILITY_ENTRIES, ABILITY_IDS } from '@rpg/contracts'
import { dataTableColumnChromeMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import { createEqualsFilter } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import { buildContentColumns } from '../../lib/overview/content-table-config'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../lib/overview/content-overview-filter-schema'

type SkillProficiencyRow = WithCampaignAccess<SkillProficiency>

export type SkillProficienciesOverviewFilterState = ContentOverviewBaseFilterState & {
  ability?: SkillProficiency['ability']
}

const SKILL_MIDDLE_COLUMNS: ColumnDef<SkillProficiency>[] = [
  {
    accessorKey: 'ability',
    header: ({ column }) => <SortableHeader column={column}>Ability</SortableHeader>,
    cell: ({ row }) => row.getValue<SkillProficiency['ability']>('ability')?.toUpperCase() ?? '—',
    filterFn: 'equalsString',
    meta: { label: 'Ability', ...dataTableColumnChromeMeta('tiny', 'stat') },
  },
]

export const skillProficienciesFilterSchema = buildContentFilterSchema<
  SkillProficiencyRow,
  SkillProficienciesOverviewFilterState
>([
  createEqualsFilter<
    SkillProficiencyRow,
    SkillProficienciesOverviewFilterState,
    'ability',
    SkillProficiency['ability']
  >({
    id: 'ability',
    label: 'Ability',
    options: ABILITY_IDS.map((id) => ({ value: id, label: ABILITY_ENTRIES[id].label })),
    getValue: (row) => row.ability,
  }),
])

/** Skill proficiency column definitions with the name cell linked to the detail page. */
export function skillProficienciesColumns(campaignId: string) {
  return buildContentColumns<SkillProficiency>(SKILL_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.skillProficiencies.detail(campaignId, row.id),
  })
}
