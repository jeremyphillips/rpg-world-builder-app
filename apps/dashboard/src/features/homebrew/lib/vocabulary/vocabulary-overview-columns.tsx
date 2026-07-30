import {
  SortableHeader,
  dataTableColumnMeta,
  dataTableNameLinkCellVariants,
  dataTableWidthMeta,
} from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import type { VocabularyOptionWithUsage } from '@rpg/contracts'

import { buildSourceColumn } from '@/lib/data-table/column-builders'

import { VocabularyAvailabilityMetadata } from '../../components/vocabulary-availability-metadata.client'
import { VOCABULARY_SOURCE_BADGE } from './labels'

type VocabularyColumnsOptions = {
  onNameClick?: (entry: VocabularyOptionWithUsage) => void
}

export function vocabularyColumns(
  options: VocabularyColumnsOptions = {},
): ColumnDef<VocabularyOptionWithUsage>[] {
  const { onNameClick } = options

  return [
    {
      accessorKey: 'label',
      header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
      cell: ({ row }) => {
        const label = row.getValue<string>('label')
        const entry = row.original

        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="inline-flex items-center gap-2">
              {onNameClick ? (
                <button
                  type="button"
                  className={dataTableNameLinkCellVariants()}
                  onClick={() => onNameClick(entry)}
                >
                  {label}
                </button>
              ) : (
                <span className="font-medium text-foreground">{label}</span>
              )}
            </span>
            <VocabularyAvailabilityMetadata status={entry.status} />
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
    {
      accessorKey: 'usedBy',
      header: ({ column }) => <SortableHeader column={column}>Used By</SortableHeader>,
      cell: ({ row }) => row.getValue<number>('usedBy'),
      meta: {
        ...dataTableColumnMeta.data,
        label: 'Used By',
        ...dataTableWidthMeta('compactCenter'),
      },
    },
  ]
}
