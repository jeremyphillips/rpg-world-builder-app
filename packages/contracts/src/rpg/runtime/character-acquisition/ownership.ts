import type { CharacterKind } from './kind'
import type { CharacterRulesScope } from './scope'

export type CharacterOwnershipTarget = { type: 'user' } | { type: 'campaign'; campaignId: string }

export function resolveCharacterOwnershipTarget(
  characterKind: CharacterKind,
  rulesScope: CharacterRulesScope,
): CharacterOwnershipTarget {
  if (characterKind === 'pc') {
    return { type: 'user' }
  }

  if (rulesScope.type !== 'campaign') {
    throw new Error('NPC authoring requires campaign rules scope')
  }

  return { type: 'campaign', campaignId: rulesScope.campaignId }
}
