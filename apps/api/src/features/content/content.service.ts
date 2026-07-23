import { HttpError } from '../../lib/http-error'
import { findCampaignById } from '../campaign'
import type { ContentTypeConfig } from './lib/content-type-config'
import { resolveCatalog } from './lib/resolve-catalog'

/**
 * Resolve a campaign's effective catalog for one content type (type-agnostic):
 * load the campaign's pinned ruleset, then merge system seed + overlay patches +
 * homebrew via the kernel. The system seed is never mutated.
 */
export async function resolveCatalogForCampaign<T extends { id: string }>(
  config: ContentTypeConfig<T>,
  campaignId: string,
): Promise<T[]> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const { rulesetId } = campaign
  const [patches, homebrew] = await Promise.all([
    config.loadPatches(campaignId),
    config.loadHomebrew(campaignId, rulesetId),
  ])

  return resolveCatalog(config.loadSystem(rulesetId), patches, homebrew, {
    replaceKeys: config.patchReplaceKeys,
  })
}
