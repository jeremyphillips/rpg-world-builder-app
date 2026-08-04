import type { ContentDeletionAvailability, ContentUsageBlocker } from '@rpg/contracts'

import { findLocationPartyBlockersForCharacter } from '../content'

/** Advisory preflight for PC/NPC delete when location party associations exist. */
export async function getCharacterLocationPartyDeletionBlockers(
  characterId: string,
): Promise<ContentUsageBlocker[]> {
  return findLocationPartyBlockersForCharacter(characterId)
}

export async function getCharacterDeletionAvailability(
  characterId: string,
): Promise<ContentDeletionAvailability> {
  const blockers = await getCharacterLocationPartyDeletionBlockers(characterId)
  if (blockers.length > 0) {
    return { status: 'blocked', blockers }
  }
  return { status: 'allowed' }
}

export async function getCharacterDeletionBlockersForCampaign(
  campaignId: string,
  characterId: string,
): Promise<ContentUsageBlocker[]> {
  const { findLocationPartyBlockersForCharacterInCampaign } = await import('../content')
  return findLocationPartyBlockersForCharacterInCampaign(campaignId, characterId)
}
