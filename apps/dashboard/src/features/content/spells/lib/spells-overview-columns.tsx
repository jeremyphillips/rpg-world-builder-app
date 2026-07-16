import type { EffectsModelingStatus, Spell } from '@rpg/contracts'
import {
  deriveEffectsModelingStatus,
  EFFECTS_MODELING_STATUS,
  getEffectsModelingStatusLabel,
  MAX_SPELL_CONTENT_LEVEL,
  MIN_SPELL_CONTENT_LEVEL,
} from '@rpg/contracts'
import { BooleanCell, dataTableWidthMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef, FilterDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { getSpellSchoolLabelFromVocabulary, type SpellSchoolVocabulary } from '@/features/homebrew'
import { buildContentColumns, buildContentFilters } from '../../lib/overview/content-table-config'
import { formatCastingTime, formatSpellLevelLabel } from '../lib/format-spell-metadata'

const SPELL_LEVEL_FILTER_OPTIONS = Array.from(
  { length: MAX_SPELL_CONTENT_LEVEL - MIN_SPELL_CONTENT_LEVEL + 1 },
  (_, index) => {
    const level = MIN_SPELL_CONTENT_LEVEL + index
    return { label: formatSpellLevelLabel(level), value: String(level) }
  },
)

const EFFECTS_MODELING_STATUS_FILTER_OPTIONS = EFFECTS_MODELING_STATUS.map((status) => ({
  label: getEffectsModelingStatusLabel(status),
  value: status,
}))

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
      id: 'effectsModelingStatus',
      accessorFn: (row) => deriveEffectsModelingStatus(row),
      header: ({ column }) => <SortableHeader column={column}>Effects modeling</SortableHeader>,
      cell: ({ row }) =>
        getEffectsModelingStatusLabel(row.getValue<EffectsModelingStatus>('effectsModelingStatus')),
      filterFn: 'equalsString',
      meta: { label: 'Effects modeling', ...dataTableWidthMeta('medium') },
    },
  ]
}

function buildSpellsSpecificFilters(
  spellSchoolVocabulary: SpellSchoolVocabulary | undefined,
): FilterDef[] {
  const schoolOptions = spellSchoolVocabulary
    ? [...spellSchoolVocabulary.activeIds].sort().map((school) => ({
        label: getSpellSchoolLabelFromVocabulary(spellSchoolVocabulary, school),
        value: school,
      }))
    : []

  return [
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
      options: schoolOptions,
    },
    {
      type: 'select',
      id: 'effectsModelingStatus',
      label: 'Effects modeling',
      options: EFFECTS_MODELING_STATUS_FILTER_OPTIONS,
      group: 'secondary',
    },
  ]
}

/** Spell column definitions with the name cell linked to the detail page. */
export function spellsColumns(campaignId: string, spellSchoolVocabulary?: SpellSchoolVocabulary) {
  return buildContentColumns<Spell>(buildSpellsMiddleColumns(spellSchoolVocabulary), {
    nameHref: (row) => ROUTES.content.spells.detail(campaignId, row.id),
  })
}

export function spellsFilters(spellSchoolVocabulary?: SpellSchoolVocabulary) {
  return buildContentFilters(buildSpellsSpecificFilters(spellSchoolVocabulary))
}
