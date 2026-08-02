import {
  SortableHeader,
  dataTableColumnMeta,
  dataTableNameLinkCellVariants,
  dataTableWidthMeta,
} from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import type { VocabularyOptionWithUsage, VocabularyUsageSummaryLabels } from '@rpg/contracts'
import { Link } from 'react-router-dom'

import { buildCollectionCountColumn, buildSourceColumn } from '@/lib/data-table/column-builders'

import { VocabularyAvailabilityMetadata } from '../../components/vocabulary-availability-metadata.client'
import { VOCABULARY_SOURCE_BADGE } from './labels'

const utilityLinkClassName =
  'hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline'

type VocabularyColumnsOptions = {
  nameHref?: (entry: VocabularyOptionWithUsage) => string
  onEdit?: (entry: VocabularyOptionWithUsage) => void
  canEdit?: boolean
  usageSummaryLabels?: VocabularyUsageSummaryLabels
}

function mapUsedBySummaryToCollectionItems(
  entry: VocabularyOptionWithUsage,
): { id: string; label: string }[] {
  return (entry.usedBySummary ?? []).map((reference) => ({
    id: reference.id,
    label: reference.label,
  }))
}

function buildVocabularyUsedByColumn(
  usageSummaryLabels: VocabularyUsageSummaryLabels,
): ColumnDef<VocabularyOptionWithUsage> {
  return buildCollectionCountColumn({
    id: 'usedBy',
    label: 'Used By',
    getItems: mapUsedBySummaryToCollectionItems,
    getCount: (row) => row.usedBy,
    singularLabel: usageSummaryLabels.singular,
    pluralLabel: usageSummaryLabels.plural,
  })
}

export function vocabularyColumns(
  options: VocabularyColumnsOptions = {},
): ColumnDef<VocabularyOptionWithUsage>[] {
  const { nameHref, onEdit, canEdit = false, usageSummaryLabels } = options

  const columns: ColumnDef<VocabularyOptionWithUsage>[] = [
    {
      accessorKey: 'label',
      header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
      cell: ({ row }) => {
        const label = row.getValue<string>('label')
        const entry = row.original
        const href = nameHref?.(entry)
        const showEdit = canEdit && onEdit

        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="inline-flex items-center gap-2">
              {href ? (
                <Link to={href} className={dataTableNameLinkCellVariants()}>
                  {label}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{label}</span>
              )}
            </span>
            {showEdit || entry.status !== 'active' ? (
              <div className="flex min-h-4 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs leading-4">
                {showEdit ? (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <button
                      type="button"
                      className={utilityLinkClassName}
                      onClick={() => onEdit(entry)}
                    >
                      Edit
                    </button>
                  </span>
                ) : null}
                <VocabularyAvailabilityMetadata status={entry.status} />
              </div>
            ) : null}
          </div>
        )
      },
      meta: {
        ...dataTableColumnMeta.identity,
        ...dataTableWidthMeta('title'),
        label: 'Name',
        locked: true,
      },
    },
    buildSourceColumn<VocabularyOptionWithUsage, VocabularyOptionWithUsage['source']>({
      badgeMap: VOCABULARY_SOURCE_BADGE,
      width: 'badge',
    }),
  ]

  if (usageSummaryLabels) {
    columns.push(buildVocabularyUsedByColumn(usageSummaryLabels))
  }

  return columns
}
