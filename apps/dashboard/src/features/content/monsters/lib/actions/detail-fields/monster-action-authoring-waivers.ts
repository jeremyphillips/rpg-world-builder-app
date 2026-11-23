import type { MonsterActionKind } from '@rpg/contracts'

import type { MonsterActionSection } from '../references/monster-action-equipment-references'

/** `${section}:${kind}` keys exempt from non-empty detail-field coverage (document reason). */
export type MonsterActionAuthoringWaiverKey = `${MonsterActionSection}:${MonsterActionKind}`

/**
 * Intentional sparse or delegated authoring for eligible section×kind pairs.
 * Prefer fixing composers over adding waivers.
 */
export const MONSTER_ACTION_AUTHORING_WAIVERS = {
  // Legendary `save` rows use editor chrome outside legendary category fields; shared route is minimal.
  'legendaryActions:save': 'legendary save uses shared mechanics without category overlay',
} as const satisfies Partial<Record<MonsterActionAuthoringWaiverKey, string>>
