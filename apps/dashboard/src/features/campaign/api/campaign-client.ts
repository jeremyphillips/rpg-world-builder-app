import type {
  Campaign,
  CampaignListItem,
  CampaignTemplate,
  CreateCampaignInput,
  UpdateCampaignInput,
  SessionUser,
} from '@rpg/contracts'

import { patchJson, postJson, putJson, request } from '@/lib/api-client'

/** Create a campaign, or throw `ApiError` on failure. */
export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  const { campaign } = await postJson<{ campaign: Campaign }>(
    '/api/campaigns',
    input,
    'Could not create campaign.',
  )
  return campaign
}

/** List shipped templates available to campaign creation. */
export async function listCampaignTemplates(): Promise<CampaignTemplate[]> {
  const { campaignTemplates } = await request<{ campaignTemplates: CampaignTemplate[] }>(
    '/api/campaigns/templates',
    undefined,
    'Could not load campaign templates.',
  )
  return campaignTemplates
}

/** Update a campaign's identity, settings, or flavor, or throw `ApiError` on failure. */
export async function updateCampaign(
  campaignId: string,
  input: UpdateCampaignInput,
): Promise<Campaign> {
  const { campaign } = await patchJson<{ campaign: Campaign }>(
    `/api/campaigns/${campaignId}`,
    input,
    'Could not update campaign.',
  )
  return campaign
}

/** List every campaign the current user owns or belongs to. */
export async function listCampaigns(): Promise<CampaignListItem[]> {
  const { campaigns } = await request<{ campaigns: CampaignListItem[] }>(
    '/api/campaigns',
    undefined,
    'Could not load campaigns.',
  )
  return campaigns
}

/**
 * Persist the user's most recently selected campaign on the server. Returns the
 * updated session user so the caller can refresh the session cache.
 */
export async function rememberSelectedCampaign(campaignId: string): Promise<SessionUser> {
  const { user } = await putJson<{ user: SessionUser }>(
    '/api/campaigns/selection',
    { campaignId },
    'Could not update selected campaign.',
  )
  return user
}
