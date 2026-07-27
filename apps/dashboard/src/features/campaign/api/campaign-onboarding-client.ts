import type {
  CampaignEligibleCharacter,
  CampaignOnboardingContext,
  CompleteCampaignOnboardingInput,
  CompleteCampaignOnboardingResult,
} from '@rpg/contracts'

import { postJson, request } from '@/lib/api-client'

const ONBOARDING_CONTEXT_ERROR = 'Could not load campaign onboarding.'
const ELIGIBLE_CHARACTERS_ERROR = 'Could not load eligible characters.'
const COMPLETE_ONBOARDING_ERROR = 'Could not add this character to the campaign.'

export async function fetchCampaignOnboardingContext(
  campaignId: string,
): Promise<CampaignOnboardingContext> {
  const { context } = await request<{ context: CampaignOnboardingContext }>(
    `/api/campaigns/${encodeURIComponent(campaignId)}/onboarding-context`,
    undefined,
    ONBOARDING_CONTEXT_ERROR,
  )
  return context
}

export async function fetchCampaignEligibleCharacters(
  campaignId: string,
): Promise<CampaignEligibleCharacter[]> {
  const { characters } = await request<{ characters: CampaignEligibleCharacter[] }>(
    `/api/campaigns/${encodeURIComponent(campaignId)}/onboarding/eligible-characters`,
    undefined,
    ELIGIBLE_CHARACTERS_ERROR,
  )
  return characters
}

export async function completeCampaignOnboarding(
  campaignId: string,
  input: CompleteCampaignOnboardingInput,
): Promise<CompleteCampaignOnboardingResult> {
  return postJson<CompleteCampaignOnboardingResult>(
    `/api/campaigns/${encodeURIComponent(campaignId)}/onboarding/complete`,
    input,
    COMPLETE_ONBOARDING_ERROR,
  )
}
