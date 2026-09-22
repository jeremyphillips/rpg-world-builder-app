import type { QueryClient } from '@tanstack/react-query'

import { campaignCharacterQueryKey } from '@/features/campaign'
import { locationsQueryKey } from '@/features/content'

import { characterLocationReferencesQueryKey } from '../hooks/use-character-location-references'
import type { CharacterOrganizationMembershipSubjectKind } from './invalidate-character-organization-membership-queries'
import { npcQueryKey } from '../npc/hooks/use-npcs'

export async function invalidateCharacterLocationConnectionQueries(
  queryClient: QueryClient,
  input: {
    campaignId: string
    characterId: string
    subjectKind: CharacterOrganizationMembershipSubjectKind
    locationIds?: readonly string[]
  },
): Promise<void> {
  const invalidations: Promise<void>[] = [
    queryClient.invalidateQueries({
      queryKey: characterLocationReferencesQueryKey(input.campaignId, input.characterId),
    }),
    queryClient.invalidateQueries({ queryKey: locationsQueryKey(input.campaignId) }),
  ]

  if (input.subjectKind === 'pc') {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: campaignCharacterQueryKey(input.campaignId, input.characterId),
      }),
    )
  } else {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: npcQueryKey(input.campaignId, input.characterId),
      }),
    )
  }

  await Promise.all(invalidations)
}
