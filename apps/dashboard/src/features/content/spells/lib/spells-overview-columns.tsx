import type { ModelingStatus, Spell, WithCampaignAccess } from '@rpg/contracts'
import {
  effectiveSpellModelingStatus,
  getModelingStatusLabel,
  MAX_SPELL_CONTENT_LEVEL,
  MIN_SPELL_CONTENT_LEVEL,
  MODELING_STATUS_LADDER,
} from '@rpg/contracts'
import { BooleanCell, dataTableWidthMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import { createEqualsFilter } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import {
  getSpellSchoolLabelFromVocabulary,
  type SpellSchoolVocabulary,
} from '@/features/vocabulary'
import { buildContentColumns } from '../../lib/overview/content-table-config'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../lib/overview/content-overview-filter-schema'
import { formatCastingTime, formatSpellLevelLabel } from '../lib/format-spell-metadata'

const SPELL_LEVEL_FILTER_OPTIONS = Array.from(
  { length: MAX_SPELL_CONTENT_LEVEL - MIN_SPELL_CONTENT_LEVEL + 1 },
  (_, index) => {
    const level = MIN_SPELL_CONTENT_LEVEL + index
    return { label: formatSpellLevelLabel(level), value: String(level) }
  },
)

const MODELING_STATUS_FILTER_OPTIONS = MODELING_STATUS_LADDER.map((status) => ({
  label: getModelingStatusLabel(status),
  value: status,
}))

type SpellRow = WithCampaignAccess<Spell>

export type SpellsOverviewFilterState = ContentOverviewBaseFilterState & {
  level?: string
  school?: string
  modelingStatus?: ModelingStatus
}

function buildSpellsMiddleColumns(
  spellSchoolVocabulary: SpellSchoolVocabulary | undefined,
): ColumnDef<Spell>[] {
  return [
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
      cell: ({ row }) =>
        getSpellSchoolLabelFromVocabulary(spellSchoolVocabulary, row.getValue<string>('school')),
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
    {
      id: 'modelingStatus',
      accessorFn: (row) => effectiveSpellModelingStatus(row),
      header: ({ column }) => <SortableHeader column={column}>Modeling</SortableHeader>,
      cell: ({ row }) => getModelingStatusLabel(row.getValue<ModelingStatus>('modelingStatus')),
      filterFn: 'equalsString',
      meta: { label: 'Modeling', ...dataTableWidthMeta('medium') },
    },
  ]
}

function buildSpellsFilterSchema(spellSchoolVocabulary: SpellSchoolVocabulary | undefined) {
  const schoolOptions = spellSchoolVocabulary
    ? [...spellSchoolVocabulary.activeIds].sort().map((school) => ({
        label: getSpellSchoolLabelFromVocabulary(spellSchoolVocabulary, school),
        value: school,
      }))
    : []

  return buildContentFilterSchema<SpellRow, SpellsOverviewFilterState>('spells', [
    createEqualsFilter<SpellRow, SpellsOverviewFilterState, 'level', string>({
      id: 'level',
      label: 'Level',
      options: SPELL_LEVEL_FILTER_OPTIONS,
      getValue: (row) => String(row.level),
    }),
    createEqualsFilter<SpellRow, SpellsOverviewFilterState, 'school', string>({
      id: 'school',
      label: 'School',
      options: schoolOptions,
      getValue: (row) => row.school,
    }),
    createEqualsFilter<SpellRow, SpellsOverviewFilterState, 'modelingStatus', ModelingStatus>({
      id: 'modelingStatus',
      label: 'Modeling',
      placement: 'advanced',
      layout: 'stacked',
      width: 'md',
      options: MODELING_STATUS_FILTER_OPTIONS,
      getValue: (row) => effectiveSpellModelingStatus(row),
    }),
  ])
}

/** Spell column definitions with the name cell linked to the detail page. */
export function spellsColumns(campaignId: string, spellSchoolVocabulary?: SpellSchoolVocabulary) {
  return buildContentColumns<Spell>(buildSpellsMiddleColumns(spellSchoolVocabulary), {
    contentType: 'spells',
    nameHref: (row) => ROUTES.content.spells.detail(campaignId, row.id),
  })
}

export function spellsFilterSchema(spellSchoolVocabulary?: SpellSchoolVocabulary) {
  return buildSpellsFilterSchema(spellSchoolVocabulary)
}
