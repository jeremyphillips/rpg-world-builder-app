import type {
  CharacterBuildCatalogIndex,
  CharacterRosterStatus,
  CharacterVitalStatus,
  NpcCharacter,
} from '@rpg/contracts'
import {
  CHARACTER_ROSTER_STATUS_ENTRIES,
  CHARACTER_ROSTER_STATUSES,
  CHARACTER_VITAL_STATUS_ENTRIES,
  CHARACTER_VITAL_STATUSES,
} from '@rpg/contracts'
import {
  createEqualsFilter,
  createFilterSchema,
  createTextFilter,
  type FilterSchema,
} from '@rpg/ui/filters'

import {
  NPC_OVERVIEW_LABELS,
  NPC_ROSTER_COLUMN_LABEL,
  NPC_VITAL_COLUMN_LABEL,
} from './npc-overview-labels'

export type NpcOverviewFilterState = {
  name?: string
  classId?: string
  speciesId?: string
  rosterStatus?: CharacterRosterStatus
  vitalStatus?: CharacterVitalStatus
}

function catalogIndexOptions<T extends { id: string; name: string }>(
  map: ReadonlyMap<string, T>,
): Array<{ label: string; value: string }> {
  return [...map.values()]
    .map((entry) => ({ label: entry.name, value: entry.id }))
    .sort((left, right) => left.label.localeCompare(right.label))
}

function rosterStatusOptions() {
  return CHARACTER_ROSTER_STATUSES.map((value) => ({
    value,
    label: CHARACTER_ROSTER_STATUS_ENTRIES[value].label,
  }))
}

function vitalStatusOptions() {
  return CHARACTER_VITAL_STATUSES.map((value) => ({
    value,
    label: CHARACTER_VITAL_STATUS_ENTRIES[value].label,
  }))
}

export function npcOverviewFilterSchema(
  catalogIndex: CharacterBuildCatalogIndex,
): FilterSchema<NpcCharacter, NpcOverviewFilterState> {
  return createFilterSchema([
    createTextFilter<NpcCharacter, NpcOverviewFilterState, 'name'>({
      id: 'name',
      label: NPC_OVERVIEW_LABELS.name,
      placeholder: 'Search…',
      url: { key: 'q' },
      getSearchText: (row) => row.name,
    }),
    createEqualsFilter<NpcCharacter, NpcOverviewFilterState, 'classId', string>({
      id: 'classId',
      label: NPC_OVERVIEW_LABELS.class,
      options: catalogIndexOptions(catalogIndex.classes),
      getValue: (row) => row.classes[0]?.classId ?? '',
    }),
    createEqualsFilter<NpcCharacter, NpcOverviewFilterState, 'speciesId', string>({
      id: 'speciesId',
      label: NPC_OVERVIEW_LABELS.species,
      options: catalogIndexOptions(catalogIndex.species),
      getValue: (row) => row.species.id,
    }),
    createEqualsFilter<NpcCharacter, NpcOverviewFilterState, 'rosterStatus', CharacterRosterStatus>(
      {
        id: 'rosterStatus',
        label: NPC_ROSTER_COLUMN_LABEL,
        placement: 'advanced',
        layout: 'stacked',
        width: 'md',
        options: rosterStatusOptions(),
        getValue: (row) => row.lifecycle.roster.status,
      },
    ),
    createEqualsFilter<NpcCharacter, NpcOverviewFilterState, 'vitalStatus', CharacterVitalStatus>({
      id: 'vitalStatus',
      label: NPC_VITAL_COLUMN_LABEL,
      placement: 'advanced',
      layout: 'stacked',
      width: 'md',
      options: vitalStatusOptions(),
      getValue: (row) => row.lifecycle.vital.status,
    }),
  ])
}
