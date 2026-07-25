'use client'

import type { NpcCharacter } from '@rpg/contracts'
import type { FilterFieldId, FilterSchema } from '@rpg/ui/filters'

import {
  useOverviewQueryState,
  type OverviewQueryActions,
  type OverviewQueryState,
} from '@/lib/overview-query-state'

import type { NpcOverviewFilterState } from './npc-overview-filter-schema'

export type UseNpcOverviewQueryStateOptions = {
  schema: FilterSchema<NpcCharacter, NpcOverviewFilterState>
}

export type NpcOverviewQueryActions = OverviewQueryActions<NpcOverviewFilterState>

/** URL-synced filter state for the NPC overview table. */
export function useNpcOverviewQueryState({ schema }: UseNpcOverviewQueryStateOptions): {
  query: OverviewQueryState<NpcOverviewFilterState>
  actions: NpcOverviewQueryActions
} {
  return useOverviewQueryState({
    schema,
    allowedSortIds: [],
    mode: 'url',
  })
}

export type { FilterFieldId }
