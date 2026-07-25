import { Link } from 'react-router-dom'
import type { CharacterBuildCatalogIndex, NpcCharacter } from '@rpg/contracts'
import { dataTableWidthMeta, SortableHeader } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import { resolveNpcOverviewClassName, resolveNpcOverviewSpeciesName } from './npc-overview-display'
import { NPC_OVERVIEW_LABELS } from './npc-overview-labels'

export function npcsOverviewColumns(
  campaignId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): ColumnDef<NpcCharacter>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <SortableHeader column={column}>{NPC_OVERVIEW_LABELS.name}</SortableHeader>
      ),
      cell: ({ row }) => (
        <Link
          to={ROUTES.campaign.npcs.detail(campaignId, row.original.id)}
          className="font-medium text-foreground hover:underline"
        >
          {row.original.name}
        </Link>
      ),
      meta: { label: NPC_OVERVIEW_LABELS.name, locked: true },
    },
    {
      id: 'class',
      accessorFn: (row) => resolveNpcOverviewClassName(row, catalogIndex),
      header: ({ column }) => (
        <SortableHeader column={column}>{NPC_OVERVIEW_LABELS.class}</SortableHeader>
      ),
      cell: ({ row }) => row.getValue<string>('class'),
      meta: { label: NPC_OVERVIEW_LABELS.class, ...dataTableWidthMeta('medium') },
    },
    {
      id: 'species',
      accessorFn: (row) => resolveNpcOverviewSpeciesName(row, catalogIndex),
      header: ({ column }) => (
        <SortableHeader column={column}>{NPC_OVERVIEW_LABELS.species}</SortableHeader>
      ),
      cell: ({ row }) => row.getValue<string>('species'),
      meta: { label: NPC_OVERVIEW_LABELS.species, ...dataTableWidthMeta('medium') },
    },
  ]
}
