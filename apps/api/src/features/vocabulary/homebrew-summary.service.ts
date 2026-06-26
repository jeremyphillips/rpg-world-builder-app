import type { HomebrewContentSummary, HomebrewSummaryContentType } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { findCampaignById } from '../campaign'
import { resolveCatalogForCampaign } from '../content/content.service'
import { getContentTypeConfig } from '../content/content-types'
import type { ContentTypeConfig } from '../content/lib/content-type-config'

const SUMMARY_CONTENT_TYPES = [
  'classes',
  'spells',
  'species',
  'feats',
  'equipment',
  'skill-proficiencies',
] as const satisfies readonly HomebrewSummaryContentType[]

/** Resolved catalog counts for Homebrew hub cards — one round trip instead of N list calls. */
export async function getHomebrewContentSummary(
  campaignId: string,
): Promise<HomebrewContentSummary> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const counts = await Promise.all(
    SUMMARY_CONTENT_TYPES.map(async (contentType) => {
      const config = getContentTypeConfig(contentType) as ContentTypeConfig<{ id: string }>
      const items = await resolveCatalogForCampaign(config, campaignId)
      return { contentType, totalCount: items.length }
    }),
  )

  return { content: counts }
}
