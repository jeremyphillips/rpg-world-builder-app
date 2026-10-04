import type { CharacterKind } from '../character-acquisition/kind'

import type { MagicItemAllowanceRequirement } from './equipment/magic-item-selection'

// ---------------------------------------------------------------------------
// Character kind policy — the only place this module reads character kind.
// Level, class, and UI flags stay on their current owners.
// ---------------------------------------------------------------------------

export type CharacterKindPolicy = {
  equipment: {
    magicItems: {
      requirement: MagicItemAllowanceRequirement
    }
  }
}

const CHARACTER_KIND_POLICIES = {
  pc: {
    equipment: {
      magicItems: { requirement: 'exact' },
    },
  },
  npc: {
    equipment: {
      magicItems: { requirement: 'up_to' },
    },
  },
} as const satisfies Record<CharacterKind, CharacterKindPolicy>

export function resolveCharacterKindPolicy(characterKind: CharacterKind): CharacterKindPolicy {
  return CHARACTER_KIND_POLICIES[characterKind]
}

export function resolveMagicItemGrantRequirement(
  characterKind: CharacterKind,
): MagicItemAllowanceRequirement {
  return resolveCharacterKindPolicy(characterKind).equipment.magicItems.requirement
}
