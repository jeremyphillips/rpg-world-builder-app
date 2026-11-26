import { contentTypeKeySchema, type CatalogOverlayListFailure } from '@rpg/contracts'

import { HttpError } from '../../lib/http-error'
import { findCampaignById } from '../campaign'
import type { ContentTypeConfig } from './lib/content-type-config'
import { loadSystemContent, loadSystemContentPatches } from './lib/content-type-config'
import { enrichResolvedSystemRecords } from './lib/enrich-system-content-read'
import { resolveCatalog } from './lib/resolve-catalog'

type CampaignCatalogResolution<T extends { id: string }> = {
  items: T[]
  overlayFailures: CatalogOverlayListFailure[]
}

async function resolveCampaignCatalogKernel<T extends { id: string }>(
  config: ContentTypeConfig<T>,
  campaignId: string,
): Promise<CampaignCatalogResolution<T>> {
  const campaign = await findCampaignById(campaignId)
  if (!campaign) {
    throw new HttpError(404, 'not_found', 'Campaign not found.')
  }

  const { rulesetId } = campaign
  const systemSeed = loadSystemContent(config, rulesetId)
  const [patches, homebrew] = await Promise.all([
    loadSystemContentPatches(config, campaignId),
    config.loadHomebrew(campaignId, rulesetId),
  ])

  const contentTypeKey = contentTypeKeySchema.safeParse(config.type).data
  const { records, overlayFailures } = resolveCatalog(systemSeed, patches, homebrew, {
    ...(contentTypeKey ? { contentTypeKey } : {}),
    overlayParticipantId: config.overlayParticipantId,
  })
  const seedById = new Map(
    systemSeed.map((record) => [record.id, record as unknown as Record<string, unknown>]),
  )
  const items = enrichResolvedSystemRecords(records, seedById, patches, config.overlayParticipantId)
  return { items, overlayFailures }
}

/**
 * Resolve a campaign's effective catalog for one content type (type-agnostic):
 * load the campaign's pinned ruleset, then merge system seed + overlay patches +
 * homebrew via the kernel. The system seed is never mutated.
 */
export async function resolveCatalogForCampaign<T extends { id: string }>(
  config: ContentTypeConfig<T>,
  campaignId: string,
): Promise<T[]> {
  const { items } = await resolveCampaignCatalogKernel(config, campaignId)
  return items
}

/** List handlers: resolved entities plus overlay apply failures omitted from `items`. */
export async function resolveContentListForCampaign<T extends { id: string }>(
  config: ContentTypeConfig<T>,
  campaignId: string,
): Promise<CampaignCatalogResolution<T>> {
  return resolveCampaignCatalogKernel(config, campaignId)
}

export async function resolveCatalogForCampaignWithOverlayContext<T extends { id: string }>(
  config: ContentTypeConfig<T>,
  campaignId: string,
): Promise<{
  records: T[]
  overlayFailures: CatalogOverlayListFailure[]
  overlayFailureIds: ReadonlySet<string>
}> {
  const { items, overlayFailures } = await resolveCampaignCatalogKernel(config, campaignId)
  return {
    records: items,
    overlayFailures,
    overlayFailureIds: new Set(overlayFailures.map((failure) => failure.targetId)),
  }
}
