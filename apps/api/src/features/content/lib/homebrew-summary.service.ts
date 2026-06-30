import type { HomebrewContentSummary } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { findCampaignById } from '../../campaign'
import { HOMEBREW_SUMMARY_TYPES, resolveContentForCampaign } from '../content-types'

/** Resolved catalog counts for Homebrew hub cards — one round trip instead of N list calls. */
export async function getHomebrewContentSummary(
  campaignId: string,
): Promise<HomebrewContentSummary> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const counts = await Promise.all(
    HOMEBREW_SUMMARY_TYPES.map(async (contentType) => {
      const items = await resolveContentForCampaign(contentType, campaignId)
      return { contentType, totalCount: items.length }
    }),
  )

  return { content: counts }
}
