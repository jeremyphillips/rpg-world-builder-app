'use client'

import type { FilterFieldId, FilterSchema } from '@rpg/ui/filters'

import {
  useOverviewQueryState,
  type OverviewQueryActions,
  type OverviewQueryState,
} from '@/lib/overview-query-state'

import type { NpcOverviewFilterState } from '../lib/npc-overview-filter-schema'
import type { NpcOverviewTableRow } from '../lib/npc-overview-row'

export type UseNpcOverviewQueryStateOptions = {
  schema: FilterSchema<NpcOverviewTableRow, NpcOverviewFilterState>
}

export type NpcOverviewQueryActions = OverviewQueryActions<NpcOverviewFilterState>

/** URL-synced filter state for the NPC overview table. */
export function useNpcOverviewQueryState({ schema }: UseNpcOverviewQueryStateOptions): {
  query: OverviewQueryState<NpcOverviewFilterState>
  actions: NpcOverviewQueryActions
} {
  return useOverviewQueryState({
    schema,
    allowedSortIds: ['name', 'class', 'species', 'roster', 'vital'],
    mode: 'url',
  })
}

export type { FilterFieldId }
