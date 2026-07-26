import type {
  CampaignInviteEligibleCharacter,
  CampaignInviteOnboardingContext,
  CompleteCampaignInviteResult,
} from '@rpg/contracts'

import { postJson, request } from '@/lib/api-client'

const ONBOARDING_CONTEXT_ERROR = 'Could not load campaign onboarding.'
const ELIGIBLE_CHARACTERS_ERROR = 'Could not load eligible characters.'
const COMPLETE_INVITE_ERROR = 'Could not add this character to the campaign.'

export async function fetchCampaignInviteOnboardingContext(
  inviteId: string,
): Promise<CampaignInviteOnboardingContext> {
  const { context } = await request<{ context: CampaignInviteOnboardingContext }>(
    `/api/campaign-invites/${encodeURIComponent(inviteId)}/onboarding-context`,
    undefined,
    ONBOARDING_CONTEXT_ERROR,
  )
  return context
}

export async function fetchEligibleCharactersForInvite(
  inviteId: string,
): Promise<CampaignInviteEligibleCharacter[]> {
  const { characters } = await request<{ characters: CampaignInviteEligibleCharacter[] }>(
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
}): Promise<CompleteCampaignInviteResult> {
  return postJson<CompleteCampaignInviteResult>(
    `/api/campaign-invites/${encodeURIComponent(inviteId)}/complete-with-existing-character`,
    { characterId },
    COMPLETE_INVITE_ERROR,
  )
}
