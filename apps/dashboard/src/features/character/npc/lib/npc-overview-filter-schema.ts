import type { CharacterBuildCatalogIndex, NpcCharacter } from '@rpg/contracts'
import {
  createEqualsFilter,
  createFilterSchema,
  createTextFilter,
  type FilterSchema,
} from '@rpg/ui/filters'

import { NPC_OVERVIEW_LABELS } from './npc-overview-labels'

export type NpcOverviewFilterState = {
  name?: string
  classId?: string
  speciesId?: string
}

function catalogIndexOptions<T extends { id: string; name: string }>(
  map: ReadonlyMap<string, T>,
): Array<{ label: string; value: string }> {
  return [...map.values()]
    .map((entry) => ({ label: entry.name, value: entry.id }))
    .sort((left, right) => left.label.localeCompare(right.label))
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
  ])
}
