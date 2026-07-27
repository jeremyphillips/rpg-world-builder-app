import type {
  CampaignEligibleCharacter,
  CompleteCampaignCharacterAssignmentResult,
  CreateCharacterInput,
} from '@rpg/contracts'

import { postJson, request } from '@/lib/api-client'

const ELIGIBLE_CHARACTERS_ERROR = 'Could not load eligible characters.'
const COMPLETE_INVITE_ERROR = 'Could not add this character to the campaign.'

export async function fetchEligibleCharactersForInvite(
  inviteId: string,
): Promise<CampaignEligibleCharacter[]> {
  const { characters } = await request<{ characters: CampaignEligibleCharacter[] }>(
    `/api/campaign-invites/${encodeURIComponent(inviteId)}/eligible-characters`,
    undefined,
    ELIGIBLE_CHARACTERS_ERROR,
  )
  return characters
}

export async function completeCampaignInviteWithExistingCharacter({
  inviteId,
  characterId,
}: {
  inviteId: string
  characterId: string
}): Promise<CompleteCampaignCharacterAssignmentResult> {
  return postJson<CompleteCampaignCharacterAssignmentResult>(
    `/api/campaign-invites/${encodeURIComponent(inviteId)}/complete-with-existing-character`,
    { characterId },
    COMPLETE_INVITE_ERROR,
  )
}

export async function completeCampaignInviteWithNewCharacter({
  inviteId,
  characterCreateInput,
}: {
  inviteId: string
  characterCreateInput: CreateCharacterInput
}): Promise<CompleteCampaignCharacterAssignmentResult> {
  return postJson<CompleteCampaignCharacterAssignmentResult>(
    `/api/campaign-invites/${encodeURIComponent(inviteId)}/complete-with-new-character`,
    { characterCreateInput },
    COMPLETE_INVITE_ERROR,
  )
}
