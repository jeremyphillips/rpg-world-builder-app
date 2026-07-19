import { Link } from 'react-router-dom'
import type { CharacterBuildCatalogIndex, NpcCharacter } from '@rpg/contracts'
import { SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { formatCharacterSummary } from '../../lib/character-display'

export function npcsOverviewColumns(
  campaignId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): ColumnDef<NpcCharacter>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
      cell: ({ row }) => (
        <Link
          to={ROUTES.campaign.npcs.detail(campaignId, row.original.id)}
          className="font-medium text-foreground hover:underline"
        >
          {row.original.name}
        </Link>
      ),
      meta: { label: 'Name' },
    },
    {
      id: 'summary',
      accessorFn: (row) => formatCharacterSummary(row, catalogIndex),
      header: 'Summary',
      cell: ({ row }) => row.getValue<string>('summary'),
      meta: { label: 'Summary' },
    },
  ]
}
