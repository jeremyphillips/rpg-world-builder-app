import type { CharacterBuildCatalogIndex } from '@rpg/contracts'
import { dataTableWidthMeta, SortableHeader, TableBadgeCell } from '@rpg/ui'
import type { ColumnDef } from '@rpg/ui'
import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/routes'

import { resolveCharacterRosterStatusPresentation } from '../../lib/campaign-roster-presentation'
import { resolveCharacterVitalStatusPresentation } from '../../lib/display/character-vital-presentation'
import { resolveNpcOverviewClassName, resolveNpcOverviewSpeciesName } from './npc-overview-display'
import {
  NPC_OVERVIEW_LABELS,
  NPC_ROSTER_COLUMN_LABEL,
  NPC_VITAL_COLUMN_LABEL,
} from './npc-overview-labels'
import type { NpcOverviewTableRow } from './npc-overview-row'

export function npcsOverviewColumns(
  campaignId: string,
  catalogIndex: CharacterBuildCatalogIndex,
): ColumnDef<NpcOverviewTableRow>[] {
  return [
    {
      accessorKey: 'character.name',
      id: 'name',
      header: ({ column }) => (
        <SortableHeader column={column}>{NPC_OVERVIEW_LABELS.name}</SortableHeader>
      ),
      cell: ({ row }) => (
        <Link
          to={ROUTES.campaign.npcs.detail(campaignId, row.original.character.id)}
          className="font-medium text-foreground hover:underline"
        >
          {row.original.character.name}
        </Link>
      ),
      meta: { label: NPC_OVERVIEW_LABELS.name, locked: true },
    },
    {
      id: 'class',
      accessorFn: (row) => resolveNpcOverviewClassName(row.character, catalogIndex),
      header: ({ column }) => (
        <SortableHeader column={column}>{NPC_OVERVIEW_LABELS.class}</SortableHeader>
      ),
      cell: ({ row }) => row.getValue<string>('class'),
      meta: { label: NPC_OVERVIEW_LABELS.class, ...dataTableWidthMeta('medium') },
    },
    {
      id: 'species',
      accessorFn: (row) => resolveNpcOverviewSpeciesName(row.character, catalogIndex),
      header: ({ column }) => (
        <SortableHeader column={column}>{NPC_OVERVIEW_LABELS.species}</SortableHeader>
      ),
      cell: ({ row }) => row.getValue<string>('species'),
      meta: { label: NPC_OVERVIEW_LABELS.species, ...dataTableWidthMeta('medium') },
    },
    {
      id: 'roster',
      accessorFn: (row) =>
        resolveCharacterRosterStatusPresentation(row.participation.roster.status).label,
      header: ({ column }) => (
        <SortableHeader column={column}>{NPC_ROSTER_COLUMN_LABEL}</SortableHeader>
      ),
      cell: ({ row }) => {
        const presentation = resolveCharacterRosterStatusPresentation(
          row.original.participation.roster.status,
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
        resolveCharacterVitalStatusPresentation(row.character.vital.status).label,
      header: ({ column }) => (
        <SortableHeader column={column}>{NPC_VITAL_COLUMN_LABEL}</SortableHeader>
      ),
      cell: ({ row }) => {
        const presentation = resolveCharacterVitalStatusPresentation(
          row.original.character.vital.status,
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
