import { Link } from 'react-router-dom'
import type { CharacterBuildCatalogIndex, NpcCharacter } from '@rpg/contracts'
import { dataTableWidthMeta, SortableHeader, TableBadgeCell } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import {
  resolveCharacterRosterStatusPresentation,
  resolveCharacterVitalStatusPresentation,
} from '../../lib/character-lifecycle-presentation'
import { resolveNpcOverviewClassName, resolveNpcOverviewSpeciesName } from './npc-overview-display'
import {
  NPC_OVERVIEW_LABELS,
  NPC_ROSTER_COLUMN_LABEL,
  NPC_VITAL_COLUMN_LABEL,
} from './npc-overview-labels'

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
    {
      id: 'roster',
      accessorFn: (row) =>
        resolveCharacterRosterStatusPresentation(row.lifecycle.roster.status).label,
      header: ({ column }) => (
        <SortableHeader column={column}>{NPC_ROSTER_COLUMN_LABEL}</SortableHeader>
      ),
      cell: ({ row }) => {
        const presentation = resolveCharacterRosterStatusPresentation(
          row.original.lifecycle.roster.status,
        )
        return (
          <TableBadgeCell appearance={presentation.appearance} tone={presentation.tone}>
            {presentation.label}
          </TableBadgeCell>
        )
      },
      meta: { label: NPC_ROSTER_COLUMN_LABEL, ...dataTableWidthMeta('badge') },
    },
    {
      id: 'vital',
      accessorFn: (row) =>
        resolveCharacterVitalStatusPresentation(row.lifecycle.vital.status).label,
      header: ({ column }) => (
        <SortableHeader column={column}>{NPC_VITAL_COLUMN_LABEL}</SortableHeader>
      ),
      cell: ({ row }) => {
        const presentation = resolveCharacterVitalStatusPresentation(
          row.original.lifecycle.vital.status,
        )
        return (
          <TableBadgeCell appearance={presentation.appearance} tone={presentation.tone}>
            {presentation.label}
          </TableBadgeCell>
        )
      },
      meta: { label: NPC_VITAL_COLUMN_LABEL, ...dataTableWidthMeta('badge') },
    },
  ]
}
