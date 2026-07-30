import {
  SortableHeader,
  TableBadgeCell,
  dataTableColumnMeta,
  dataTableNameLinkCellVariants,
  dataTableWidthMeta,
} from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import type { VocabularyOptionWithUsage } from '@rpg/contracts'

import { buildSourceColumn } from '@/lib/data-table/column-builders'

import { getVocabularyStatusLabel, VOCABULARY_SOURCE_BADGE } from './labels'

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
        if (!onNameClick) {
          return label
        }

        return (
          <button
            type="button"
            className={dataTableNameLinkCellVariants()}
            onClick={() => onNameClick(row.original)}
          >
            {label}
          </button>
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue<VocabularyOptionWithUsage['status']>('status')
        return (
          <TableBadgeCell appearance={status === 'active' ? 'neutral' : 'outline'} tone="neutral">
            {getVocabularyStatusLabel(status)}
          </TableBadgeCell>
        )
      },
      enableSorting: false,
      meta: { ...dataTableColumnMeta.data, label: 'Status', ...dataTableWidthMeta('badge') },
    },
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
