import type { CharacterKind } from '../character-acquisition/kind'
import type { CharacterRulesScope } from '../character-acquisition/scope'

import type { MagicItemAllowanceRequirement } from './equipment/magic-item-selection'

// ---------------------------------------------------------------------------
// Character kind policy — the only module that maps character kind to rules.
// Callers pass kind in and read the resolved policy. Class, connections, and
// UI flags stay on their current owners.
// ---------------------------------------------------------------------------

export type CharacterKindLevelPolicy = {
  /** Campaign-scoped builds lock to the campaign starting level. */
  lockCampaignStartingLevel: boolean
  /** May be level 0 when the campaign enables level-zero NPCs. */
  allowsLevelZero: boolean
}

export type CharacterKindPolicy = {
  equipment: {
    magicItems: {
      requirement: MagicItemAllowanceRequirement
    }
  }
  level: CharacterKindLevelPolicy
}

const CHARACTER_KIND_POLICIES = {
  pc: {
    equipment: {
      magicItems: { requirement: 'exact' },
    },
    level: {
      lockCampaignStartingLevel: true,
      allowsLevelZero: false,
    },
  },
  npc: {
    equipment: {
      magicItems: { requirement: 'up_to' },
    },
    level: {
      lockCampaignStartingLevel: false,
      allowsLevelZero: true,
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

/** Kind may be level 0, and the campaign has level-zero NPCs enabled. */
export function allowsLevelZeroForKind(
  characterKind: CharacterKind,
  levelZeroNpcsEnabled: boolean,
): boolean {
  return resolveCharacterKindPolicy(characterKind).level.allowsLevelZero && levelZeroNpcsEnabled
}

/** Campaign player characters use the campaign starting level as their only level. */
export function locksCampaignStartingLevel(
  characterKind: CharacterKind,
  scopeType: CharacterRulesScope['type'],
): boolean {
  return (
    resolveCharacterKindPolicy(characterKind).level.lockCampaignStartingLevel &&
    scopeType === 'campaign'
  )
}
