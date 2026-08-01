import type { ClassListItem, Spellcasting, WithCampaignAccess } from '@rpg/contracts'
import { BooleanCell, dataTableColumnChromeMeta, dataTableWidthMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import { createBooleanFilter, createEqualsFilter } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import { buildCollectionCountColumn } from '@/lib/data-table/column-builders'
import { buildContentColumns } from '../../lib/overview/content-table-config'
import {
  buildContentFilterSchema,
  type ContentOverviewBaseFilterState,
} from '../../lib/overview/content-overview-filter-schema'
import {
  resolveClassFeatureSummaryItems,
  resolveSubclassSummaryItems,
} from './class-overview-summary-items'

type ClassRow = WithCampaignAccess<ClassListItem>

export type ClassesOverviewFilterState = ContentOverviewBaseFilterState & {
  hitDie?: string
  spellcasting?: boolean
}

const CLASS_COLLECTION_LABELS = {
  subclasses: { singular: 'subclass', plural: 'subclasses', column: 'Subclasses' },
  features: { singular: 'feature', plural: 'features', column: 'Features' },
} as const

const CLASS_MIDDLE_COLUMNS: ColumnDef<ClassListItem>[] = [
  {
    accessorKey: 'hitDie',
    header: ({ column }) => <SortableHeader column={column}>Hit Die</SortableHeader>,
    cell: ({ row }) => `d${row.getValue<number>('hitDie')}`,
    filterFn: 'equalsString',
    meta: { label: 'Hit Die', ...dataTableWidthMeta('tiny') },
  },
  {
    accessorKey: 'primaryAbilities',
    header: 'Primary Abilities',
    cell: ({ row }) =>
      row.getValue<ClassListItem['primaryAbilities']>('primaryAbilities').join(', ').toUpperCase(),
    enableSorting: false,
    meta: {
      label: 'Primary Abilities',
      ...dataTableColumnChromeMeta('medium', 'stat'),
    },
  },
  buildCollectionCountColumn<ClassListItem>({
    id: 'subclasses',
    label: CLASS_COLLECTION_LABELS.subclasses.column,
    getItems: resolveSubclassSummaryItems,
    getCount: (row) => row.subclasses.length,
    singularLabel: CLASS_COLLECTION_LABELS.subclasses.singular,
    pluralLabel: CLASS_COLLECTION_LABELS.subclasses.plural,
  }),
  buildCollectionCountColumn<ClassListItem>({
    id: 'features',
    label: CLASS_COLLECTION_LABELS.features.column,
    getItems: resolveClassFeatureSummaryItems,
    getCount: (row) => row.features.length,
    singularLabel: CLASS_COLLECTION_LABELS.features.singular,
    pluralLabel: CLASS_COLLECTION_LABELS.features.plural,
  }),
  {
    accessorKey: 'spellcasting',
    header: 'Spellcasting',
    cell: ({ row }) => (
      <BooleanCell value={row.getValue<Spellcasting | undefined>('spellcasting') !== undefined} />
    ),
    filterFn: 'boolean',
    enableSorting: false,
    meta: { label: 'Spellcasting', ...dataTableWidthMeta('compactCenter') },
  },
]

export const classFilterSchema = buildContentFilterSchema<ClassRow, ClassesOverviewFilterState>(
  'classes',
  [
    createEqualsFilter<ClassRow, ClassesOverviewFilterState, 'hitDie', string>({
      id: 'hitDie',
      label: 'Hit Die',
      options: [
        { label: 'd6', value: '6' },
        { label: 'd8', value: '8' },
        { label: 'd10', value: '10' },
        { label: 'd12', value: '12' },
      ],
      getValue: (row) => String(row.hitDie),
    }),
    createBooleanFilter<ClassRow, ClassesOverviewFilterState, 'spellcasting'>({
      id: 'spellcasting',
      label: 'Has spellcasting',
      placement: 'primary',
      getValue: (row) => row.spellcasting !== undefined,
    }),
  ],
)

/** Class column definitions with the name cell linked to the class detail page. */
export function classColumns(campaignId: string) {
  return buildContentColumns<ClassListItem>(CLASS_MIDDLE_COLUMNS, {
    contentType: 'classes',
    nameHref: (row) => ROUTES.content.classes.detail(campaignId, row.id),
  })
}
