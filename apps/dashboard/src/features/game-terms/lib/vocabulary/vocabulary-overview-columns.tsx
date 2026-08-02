import {
  SortableHeader,
  dataTableColumnMeta,
  dataTableNameLinkCellVariants,
  dataTableWidthMeta,
} from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import type {
  VocabularyOptionWithUsage,
  VocabularyOverviewUsageScope,
  VocabularyUsageSummaryLabels,
} from '@rpg/contracts'
import { Link } from 'react-router-dom'

import { buildSourceColumn } from '@/lib/data-table/column-builders'
import { buildUsedByOverviewColumn } from '@/lib/usage-references/build-used-by-overview-column'

import { VocabularyAvailabilityMetadata } from '../../components/vocabulary-availability-metadata.client'
import { VOCABULARY_SOURCE_BADGE } from '@/features/vocabulary'

import {
  VOCABULARY_OVERVIEW_USED_BY_CONTENT_LABEL,
  VOCABULARY_OVERVIEW_USED_BY_CONTENT_TOOLTIP,
} from '../labels'

const utilityLinkClassName =
  'hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline'

type VocabularyColumnsOptions = {
  nameHref?: (entry: VocabularyOptionWithUsage) => string
  onEdit?: (entry: VocabularyOptionWithUsage) => void
  canEdit?: boolean
  usageSummaryLabels?: VocabularyUsageSummaryLabels
  overviewUsageScope?: VocabularyOverviewUsageScope
}

function buildVocabularyUsedByColumn(
  usageSummaryLabels: VocabularyUsageSummaryLabels,
  overviewUsageScope?: VocabularyOverviewUsageScope,
): ColumnDef<VocabularyOptionWithUsage> {
  const label =
    overviewUsageScope === 'content_only' ? VOCABULARY_OVERVIEW_USED_BY_CONTENT_LABEL : 'Used By'
  const scopeTooltip =
    overviewUsageScope === 'content_only' ? VOCABULARY_OVERVIEW_USED_BY_CONTENT_TOOLTIP : undefined

  return buildUsedByOverviewColumn<VocabularyOptionWithUsage>({
    usageSummaryLabels,
    columnLabel: label,
    scopeTooltip,
  })
}

export function vocabularyColumns(
  options: VocabularyColumnsOptions = {},
): ColumnDef<VocabularyOptionWithUsage>[] {
  const { nameHref, onEdit, canEdit = false, usageSummaryLabels, overviewUsageScope } = options

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
    columns.push(buildVocabularyUsedByColumn(usageSummaryLabels, overviewUsageScope))
  }

  return columns
}
