import { SortableHeader, TableBadgeCell, dataTableColumnMeta } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import type { VocabularyOptionWithUsage } from '@rpg/contracts'

import { buildNameColumn, buildSourceColumn } from '@/lib/data-table/column-builders'

import { getVocabularyStatusLabel, VOCABULARY_SOURCE_BADGE } from '../lib/vocabulary-labels'

export function vocabularyColumns(): ColumnDef<VocabularyOptionWithUsage>[] {
  return [
    buildNameColumn<VocabularyOptionWithUsage>({
      accessorKey: 'label',
      locked: true,
    }),
    buildSourceColumn<VocabularyOptionWithUsage, VocabularyOptionWithUsage['source']>({
      badgeMap: VOCABULARY_SOURCE_BADGE,
    }),
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue<VocabularyOptionWithUsage['status']>('status')
        return (
          <TableBadgeCell variant={status === 'active' ? 'secondary' : 'outline'}>
            {getVocabularyStatusLabel(status)}
          </TableBadgeCell>
        )
      },
      enableSorting: false,
      meta: { ...dataTableColumnMeta.data, label: 'Status' },
    },
    {
      accessorKey: 'usedBy',
      header: ({ column }) => <SortableHeader column={column}>Used By</SortableHeader>,
      cell: ({ row }) => row.getValue<number>('usedBy'),
      meta: { ...dataTableColumnMeta.data, label: 'Used By' },
    },
  ]
}
