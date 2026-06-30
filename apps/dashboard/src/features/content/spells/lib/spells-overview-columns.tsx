import type { Spell } from '@rpg/contracts'
import {
  MAX_SPELL_CONTENT_LEVEL,
  MIN_SPELL_CONTENT_LEVEL,
  SPELL_SCHOOLS,
  getSpellSchoolLabel,
} from '@rpg/contracts'
import { BooleanCell, dataTableWidthMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { buildContentColumns, buildContentFilters } from '../../lib/overview/content-table-config'
import { formatCastingTime, formatSpellLevelLabel } from '../lib/format-spell-metadata'

const SPELL_LEVEL_FILTER_OPTIONS = Array.from(
  { length: MAX_SPELL_CONTENT_LEVEL - MIN_SPELL_CONTENT_LEVEL + 1 },
  (_, index) => {
    const level = MIN_SPELL_CONTENT_LEVEL + index
    return { label: formatSpellLevelLabel(level), value: String(level) }
  },
)

const SPELLS_MIDDLE_COLUMNS: ColumnDef<Spell>[] = [
  {
    accessorKey: 'level',
    header: ({ column }) => <SortableHeader column={column}>Level</SortableHeader>,
    cell: ({ row }) => formatSpellLevelLabel(row.original.level),
    filterFn: (row, _columnId, filterValue) => String(row.original.level) === filterValue,
    meta: { label: 'Level', ...dataTableWidthMeta('compact') },
  },
  {
    accessorKey: 'school',
    header: ({ column }) => <SortableHeader column={column}>School</SortableHeader>,
    cell: ({ row }) => getSpellSchoolLabel(row.getValue<string>('school')),
    filterFn: 'equalsString',
    meta: { label: 'School', ...dataTableWidthMeta('medium') },
  },
  {
    id: 'castingTime',
    accessorFn: (row) => formatCastingTime(row.castingTime, { includeTrigger: false }),
    header: ({ column }) => <SortableHeader column={column}>Casting Time</SortableHeader>,
    cell: ({ row }) => row.getValue<string>('castingTime'),
    meta: { label: 'Casting Time', ...dataTableWidthMeta('compact') },
  },
  {
    id: 'ritual',
    accessorFn: (row) => row.castingTime.canBeCastAsRitual,
    header: 'Ritual',
    cell: ({ row }) => <BooleanCell value={row.getValue<boolean>('ritual')} />,
    filterFn: 'boolean',
    enableSorting: false,
    meta: { label: 'Ritual', ...dataTableWidthMeta('compactCenter') },
  },
]

const SPELLS_SPECIFIC_FILTERS: FilterDef[] = [
  {
    type: 'select',
    id: 'level',
    label: 'Level',
    options: SPELL_LEVEL_FILTER_OPTIONS,
  },
  {
    type: 'select',
    id: 'school',
    label: 'School',
    options: SPELL_SCHOOLS.map((school) => ({
      label: getSpellSchoolLabel(school),
      value: school,
    })),
  },
]

/** Spell column definitions with the name cell linked to the detail page. */
export function spellsColumns(campaignId: string) {
  return buildContentColumns<Spell>(SPELLS_MIDDLE_COLUMNS, {
    nameHref: (row) => ROUTES.content.spells.detail(campaignId, row.id),
  })
}

export const spellsFilters = buildContentFilters(SPELLS_SPECIFIC_FILTERS)
