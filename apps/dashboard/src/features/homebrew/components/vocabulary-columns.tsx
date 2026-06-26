import { Badge, SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import type { VocabularyOptionWithUsage } from '@rpg/contracts'

import { getVocabularySourceLabel, getVocabularyStatusLabel } from '../lib/vocabulary-labels'

export function vocabularyColumns(): ColumnDef<VocabularyOptionWithUsage>[] {
  return [
    {
      accessorKey: 'label',
      header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
      meta: { label: 'Name', locked: true },
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => getVocabularySourceLabel(row.getValue('source')),
      enableSorting: false,
      meta: { label: 'Source' },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue<VocabularyOptionWithUsage['status']>('status')
        return (
          <Badge variant={status === 'active' ? 'secondary' : 'outline'}>
            {getVocabularyStatusLabel(status)}
          </Badge>
        )
      },
      enableSorting: false,
      meta: { label: 'Status' },
    },
    {
      accessorKey: 'usedBy',
      header: ({ column }) => <SortableHeader column={column}>Used By</SortableHeader>,
      cell: ({ row }) => row.getValue<number>('usedBy'),
      meta: { label: 'Used By' },
    },
  ]
}
