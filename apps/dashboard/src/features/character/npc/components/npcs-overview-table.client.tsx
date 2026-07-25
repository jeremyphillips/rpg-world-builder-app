'use client'

import { Text } from '@rpg/ui'
import type { CharacterBuildCatalogIndex, NpcCharacter } from '@rpg/contracts'

import { CatalogOverviewTable } from '@/lib/data-table/catalog-overview-table.client'

import { npcOverviewFilterSchema } from '../lib/npc-overview-filter-schema'
import { NPC_OVERVIEW_TABLE_KEY } from '../lib/npc-overview-labels'
import { npcsOverviewColumns } from '../lib/npcs-overview-columns'
import { useNpcOverviewQueryState } from '../lib/use-npc-overview-query-state.client'

const NPCS_EMPTY_MESSAGE = 'No NPCs yet. Create one to populate your campaign roster.'

type NpcsOverviewTableProps = {
  campaignId: string
  catalogIndex: CharacterBuildCatalogIndex
  npcs: NpcCharacter[]
}

/** NPC overview table with URL-synced class/species filters. */
export function NpcsOverviewTable({ campaignId, catalogIndex, npcs }: NpcsOverviewTableProps) {
  const filterSchema = npcOverviewFilterSchema(catalogIndex)
  const { query, actions } = useNpcOverviewQueryState({ schema: filterSchema })

  return (
    <CatalogOverviewTable
      tableKey={NPC_OVERVIEW_TABLE_KEY}
      columns={npcsOverviewColumns(campaignId, catalogIndex)}
      data={npcs}
      filterSchema={filterSchema}
      filterState={query.filters}
      onFilterChange={(id, value) => actions.setFilterValue(id, value)}
      onResetFilters={() => actions.resetFilters()}
      caption="Non-player characters in this campaign"
      emptyState={<Text variant="muted">{NPCS_EMPTY_MESSAGE}</Text>}
    />
  )
}
