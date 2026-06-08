import type { Campaign, CreateCampaignInput } from '@rpg/contracts'

import { postJson } from '@/lib/api-client'

/** Create a campaign, or throw `ApiError` on failure. */
export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  const { campaign } = await postJson<{ campaign: Campaign }>(
    '/api/campaigns',
    input,
    'Could not create campaign.',
  )
  return campaign
}
