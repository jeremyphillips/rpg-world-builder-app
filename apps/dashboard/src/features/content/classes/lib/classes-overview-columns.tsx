import { Link } from 'react-router-dom'

import type { ClassListItem, Spellcasting, WithCampaignAccess } from '@rpg/contracts'
import type { ContentOverviewUsageScope, ContentUsageSummaryLabels } from '@rpg/contracts'
import {
  BooleanCell,
  CollectionSummaryCell,
  dataTableColumnChromeMeta,
  dataTableColumnMeta,
  dataTableWidthMeta,
  SortableHeader,
} from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import { createBooleanFilter, createEqualsFilter } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import { buildCollectionCountColumn } from '@/lib/data-table/column-builders'
import { classEditSubclassesHref } from './class-edit-navigation.lib'
import { resolveDashboardContentDisplay } from '../../lib/detail/page/content-display-image'
import { buildClassContentDisplayImageInput } from '../../lib/detail/page/content-display-image-input'
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

function subclassesOverviewColumn(campaignId: string): ColumnDef<ClassListItem> {
  return {
    id: 'subclasses',
    accessorFn: (row) => row.subclasses.length,
    header: ({ column }) => (
      <SortableHeader column={column}>{CLASS_COLLECTION_LABELS.subclasses.column}</SortableHeader>
    ),
    cell: ({ row }) => {
      const unresolved = row.original.unresolvedSubclassOverlayCount
      return (
        <div className="flex min-w-0 flex-col gap-1">
          <CollectionSummaryCell
            items={resolveSubclassSummaryItems(row.original)}
            count={row.original.subclasses.length}
            singularLabel={CLASS_COLLECTION_LABELS.subclasses.singular}
            pluralLabel={CLASS_COLLECTION_LABELS.subclasses.plural}
          />
          {unresolved ? (
            <Link
              to={classEditSubclassesHref(campaignId, row.original.id)}
              className="text-style-caption text-warning hover:underline"
            >
              {unresolved} unresolved subclass overlay{unresolved > 1 ? 's' : ''} — manage
            </Link>
          ) : null}
        </div>
      )
    },
    sortingFn: 'basic',
    meta: {
      label: CLASS_COLLECTION_LABELS.subclasses.column,
      ...dataTableColumnMeta.data,
      ...dataTableWidthMeta('collectionCount'),
    },
  }
}

/** Class column definitions with the name cell linked to the class detail page. */
export function classColumns(
  campaignId: string,
  usage?: {
    usageSummaryLabels?: ContentUsageSummaryLabels
    overviewUsageScope?: ContentOverviewUsageScope
  },
) {
  const columns: ColumnDef<ClassListItem>[] = [
    ...CLASS_MIDDLE_COLUMNS.slice(0, 2),
    subclassesOverviewColumn(campaignId),
    ...CLASS_MIDDLE_COLUMNS.slice(2),
  ]
  return buildContentColumns<ClassListItem>(columns, {
    ...usage,
    contentType: 'classes',
    resolveOverviewDisplay: (row) =>
      resolveDashboardContentDisplay(buildClassContentDisplayImageInput(row, 'compact')),
    nameHref: (row) => ROUTES.content.classes.detail(campaignId, row.id),
  })
}
