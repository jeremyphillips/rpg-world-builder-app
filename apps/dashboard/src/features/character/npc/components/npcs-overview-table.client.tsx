'use client'

import { useMemo, useRef } from 'react'
import { applyFilterSchema } from '@rpg/ui/filters'
import type { CharacterBuildCatalogIndex, NpcCharacter } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { CatalogOverviewTable } from '@/lib/data-table/catalog-overview-table.client'
import { useCanManageCampaign } from '@/features/campaign'

import { BulkRosterStatusDialog } from './bulk-roster-status-dialog.client'
import { NpcBulkActionsMenu } from './npc-bulk-actions-menu.client'
import { useNpcOverviewBulkRoster } from '../hooks/use-npc-overview-bulk-roster.client'
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

/** NPC overview table with URL-synced filters and optional roster bulk editing. */
export function NpcsOverviewTable({ campaignId, catalogIndex, npcs }: NpcsOverviewTableProps) {
  const canManage = useCanManageCampaign(campaignId)
  const filterSchema = npcOverviewFilterSchema(catalogIndex)
  const { query, actions } = useNpcOverviewQueryState({ schema: filterSchema })
  const selectTriggerRef = useRef<HTMLButtonElement>(null)

  const visibleRows = useMemo(
    () => applyFilterSchema(filterSchema, query.filters, npcs),
    [filterSchema, npcs, query.filters],
  )
  const visibleRowIds = useMemo(() => new Set(visibleRows.map((row) => row.id)), [visibleRows])

  const {
    bulkRosterOpen,
    setBulkRosterOpen,
    selectionLiveRegionId,
    selectionLiveRegionMessage,
    selectionLimit,
    selectionMode,
    rowSelection,
    selectedRows,
    selectionCapDescriptionId,
    getRowCanSelect,
    enterSelectionMode,
    handleExitSelectionMode,
    onRowSelectionChange,
    onRowSelectionStateChange,
    handleBulkApplyComplete,
    openBulkRosterDialog,
  } = useNpcOverviewBulkRoster<NpcCharacter>(visibleRowIds)

  return (
    <>
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
        selection={
          canManage
            ? {
                enabled: true,
                selectionMode,
                rowSelection,
                selectionLimit,
                selectionLiveRegionId,
                selectionLiveRegionMessage,
                selectionCapDescriptionId,
                onEnterSelectionMode: enterSelectionMode,
                onExitSelectionMode: handleExitSelectionMode,
                onRowSelectionChange,
                onRowSelectionStateChange,
                getRowCanSelect,
                selectTriggerRef,
                getSelectRowLabel: (row) => row.name,
                bulkActionsMenu: <NpcBulkActionsMenu onEditRosterStatus={openBulkRosterDialog} />,
              }
            : undefined
        }
      />

      {canManage ? (
        <BulkRosterStatusDialog
          open={bulkRosterOpen}
          onOpenChange={setBulkRosterOpen}
          campaignId={campaignId}
          selectedRows={selectedRows}
          onApplyComplete={handleBulkApplyComplete}
        />
      ) : null}
    </>
  )
}
