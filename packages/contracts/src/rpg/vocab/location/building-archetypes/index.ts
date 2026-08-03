/**
 * Neutral alphabetical shards composing BUILDING_ARCHETYPE_ENTRIES.
 * File placement carries zero semantic meaning.
 */
import type { BuildingArchetypeShardEntry } from './types'

import { BUILDING_ARCHETYPE_ENTRIES_A_C } from './a-c'
import { BUILDING_ARCHETYPE_ENTRIES_D_G } from './d-g'
import { BUILDING_ARCHETYPE_ENTRIES_H_L } from './h-l'
import { BUILDING_ARCHETYPE_ENTRIES_M_P } from './m-p'
import { BUILDING_ARCHETYPE_ENTRIES_Q_T } from './q-t'
import { BUILDING_ARCHETYPE_ENTRIES_U_Z } from './u-z'

export const BUILDING_ARCHETYPE_SHARD_ENTRIES = {
  ...BUILDING_ARCHETYPE_ENTRIES_A_C,
  ...BUILDING_ARCHETYPE_ENTRIES_D_G,
  ...BUILDING_ARCHETYPE_ENTRIES_H_L,
  ...BUILDING_ARCHETYPE_ENTRIES_M_P,
  ...BUILDING_ARCHETYPE_ENTRIES_Q_T,
  ...BUILDING_ARCHETYPE_ENTRIES_U_Z,
} as const satisfies Record<string, BuildingArchetypeShardEntry>
