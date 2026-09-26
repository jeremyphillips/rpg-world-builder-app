import type {
  CampaignCharacterGetResponse,
  CampaignParticipatingCharacterStatusPatch,
  CharacterMediaPatchInput,
} from '@rpg/contracts'

import { patchJson, request } from '@/lib/api-client'

const PATCH_CAMPAIGN_CHARACTER_MEDIA_ERROR = 'Could not update character images.'
const PATCH_CAMPAIGN_CHARACTER_STATUS_ERROR = 'Could not update character status.'

const GET_CAMPAIGN_CHARACTER_ERROR = 'Could not load character.'

export async function patchCampaignCharacterStatus(
  campaignId: string,
  characterId: string,
  patch: CampaignParticipatingCharacterStatusPatch,
): Promise<CampaignCharacterGetResponse> {
  return patchJson<CampaignCharacterGetResponse>(
    `/api/campaigns/${encodeURIComponent(campaignId)}/characters/${encodeURIComponent(characterId)}/status`,
    patch,
    PATCH_CAMPAIGN_CHARACTER_STATUS_ERROR,
  )
}

export async function patchCampaignCharacterMedia(
  campaignId: string,
  characterId: string,
  patch: CharacterMediaPatchInput,
): Promise<CampaignCharacterGetResponse> {
  return patchJson<CampaignCharacterGetResponse>(
    `/api/campaigns/${encodeURIComponent(campaignId)}/characters/${encodeURIComponent(characterId)}/media`,
    patch,
    PATCH_CAMPAIGN_CHARACTER_MEDIA_ERROR,
  )
}

export async function getCampaignCharacter(
  campaignId: string,
  characterId: string,
): Promise<CampaignCharacterGetResponse> {
  return request<CampaignCharacterGetResponse>(
    `/api/campaigns/${encodeURIComponent(campaignId)}/characters/${encodeURIComponent(characterId)}`,
    undefined,
    GET_CAMPAIGN_CHARACTER_ERROR,
  )
}
