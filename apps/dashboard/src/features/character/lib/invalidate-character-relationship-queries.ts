import type { QueryClient } from '@tanstack/react-query'

import { campaignCharacterQueryKey } from '@/features/campaign'
import { organizationMembersQueryKey } from '@/features/content'

import { characterRelationshipsQueryKey } from '../hooks/use-character-relationships'
import { npcQueryKey } from '../npc/hooks/use-npcs'

export type CharacterRelationshipSubjectKind = 'pc' | 'npc'

/** @deprecated Use CharacterRelationshipSubjectKind */
export type CharacterOrganizationMembershipSubjectKind = CharacterRelationshipSubjectKind

export type CharacterRelationshipInvalidationTarget = {
  characterId: string
  subjectKind?: CharacterRelationshipSubjectKind
}

export async function invalidateCharacterRelationshipQueries(
  queryClient: QueryClient,
  input: {
    campaignId: string
    characters: readonly CharacterRelationshipInvalidationTarget[]
    organizationIds?: readonly string[]
    locationIds?: readonly string[]
  },
): Promise<void> {
  const invalidations: Promise<void>[] = []

  for (const character of input.characters) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: characterRelationshipsQueryKey(input.campaignId, character.characterId),
      }),
    )

    if (character.subjectKind === 'pc') {
      invalidations.push(
        queryClient.invalidateQueries({
          queryKey: campaignCharacterQueryKey(input.campaignId, character.characterId),
        }),
      )
    } else if (character.subjectKind === 'npc') {
      invalidations.push(
        queryClient.invalidateQueries({
          queryKey: npcQueryKey(input.campaignId, character.characterId),
        }),
      )
    }
  }

  for (const organizationId of input.organizationIds ?? []) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: organizationMembersQueryKey(input.campaignId, organizationId),
      }),
    )
  }

  for (const locationId of input.locationIds ?? []) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: ['campaigns', input.campaignId, 'locations', locationId, 'connected-parties'],
      }),
    )
  }

  await Promise.all(invalidations)
}
