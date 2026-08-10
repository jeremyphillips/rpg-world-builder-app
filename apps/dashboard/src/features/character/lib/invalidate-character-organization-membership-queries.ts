import type { QueryClient } from '@tanstack/react-query'

import { campaignCharacterQueryKey } from '@/features/campaign'
import { organizationMembersQueryKey } from '@/features/content'

import { npcQueryKey } from '../npc/hooks/use-npcs'
import { characterOrganizationReferencesQueryKey } from '../hooks/use-character-organization-references'

export type CharacterOrganizationMembershipSubjectKind = 'pc' | 'npc'

export async function invalidateCharacterOrganizationMembershipQueries(
  queryClient: QueryClient,
  input: {
    campaignId: string
    characterId: string
    subjectKind: CharacterOrganizationMembershipSubjectKind
    organizationIds?: readonly string[]
  },
): Promise<void> {
  const invalidations: Promise<void>[] = [
    queryClient.invalidateQueries({
      queryKey: characterOrganizationReferencesQueryKey(input.campaignId, input.characterId),
    }),
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

  for (const organizationId of input.organizationIds ?? []) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: organizationMembersQueryKey(input.campaignId, organizationId),
      }),
    )
  }

  await Promise.all(invalidations)
}
