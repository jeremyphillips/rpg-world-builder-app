import type { HomebrewContentSummary } from '@rpg/contracts'

import { request } from '@/lib/api-client'

/** Resolved catalog counts for Homebrew hub content cards. */
export async function getHomebrewSummary(campaignId: string): Promise<HomebrewContentSummary> {
  const { summary } = await request<{ summary: HomebrewContentSummary }>(
    `/api/campaigns/${campaignId}/homebrew/summary`,
    undefined,
    'Could not load homebrew summary.',
  )
  return summary
}
